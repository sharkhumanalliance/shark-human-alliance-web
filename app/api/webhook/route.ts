import { buildAbsoluteLocalizedUrl, buildReferralHref } from "@/lib/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  EMAIL_FROM,
  certificateEmailHtml,
  certificateEmailSubject,
  giftBuyerNotificationEmailHtml,
  giftBuyerNotificationSubject,
  logEmailRouteEntered,
  sendEmailStrict,
} from "@/lib/email";
import {
  generateMemberId,
  generateUniqueReferralCode,
  generateUniqueRegistryCode,
  generateAccessToken,
  createMember,
  incrementReferralCount,
  getMemberByStripeSession,
} from "@/lib/members";
import { BASE_URL } from "@/lib/config";
import { DIGITAL_CONTENT_VERSION, TERMS_VERSION } from "@/lib/legal";
import { getCertificateTemplateQueryParam } from "@/lib/certificate-templates";
import { normalizePaperFormatForTemplate } from "@/lib/certificate-paper";
import { formatRegistryIdForDisplay } from "@/lib/registry-id";
import { sendGa4PurchaseEvent } from "@/lib/ga4-measurement-protocol";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  let event;

  console.log("[SHA Webhook] route entered", {
    route: "/api/webhook",
    hasSignatureHeader: !!request.headers.get("stripe-signature"),
    hasWebhookSecret: !!WEBHOOK_SECRET,
    hasResendApiKey: !!process.env.RESEND_API_KEY,
    hasEmailFrom: !!EMAIL_FROM,
  });

  try {
    const rawBody = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig || !WEBHOOK_SECRET) {
      console.warn("[SHA Webhook] Missing signature or webhook secret");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    event = getStripe().webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
    console.log("[SHA Webhook] Event constructed", {
      eventType: event.type,
      eventId: event.id,
    });
  } catch (err) {
    console.error("[SHA Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // ── Idempotency guard ──────────────────────────────────────────────
    // Stripe webhooks can be delivered more than once. If we already
    // processed this session, acknowledge and return early.
    const existing = await getMemberByStripeSession(session.id);
    if (existing) {
      console.log(
        `[SHA Webhook] Duplicate delivery for session ${session.id} — skipping`
      );
      return NextResponse.json({ received: true });
    }
    // ───────────────────────────────────────────────────────────────────

    const meta = session.metadata || {};

    const {
      tier = "protected",
      name = "Unknown",
      dedication = "",
      email = "",
      isGift = "false",
      recipientEmail = "",
      referredBy = "",
      locale = "en",
      template = "",
      paperFormat = "a4",
      giftMessage = "",
      fromName = "",
      termsAcceptedAt = "",
      termsVersion = TERMS_VERSION,
      digitalContentConsentAt = "",
      digitalContentVersion = DIGITAL_CONTENT_VERSION,
      registryVisibility = "private",
      dedicationReviewStatus = "approved",
      attributionSource = "",
      analyticsConsent = "false",
      gaClientId = "",
    } = meta;

    console.log("[SHA Webhook] checkout.session.completed received", {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      tier,
      hasName: name.trim().length > 0,
      hasEmail: email.trim().length > 0,
      hasRecipientEmail: recipientEmail.trim().length > 0,
      isGift,
      locale,
      paperFormat: normalizePaperFormatForTemplate(template, paperFormat),
      hasReferral: referredBy.trim().length > 0,
      attributionSource: attributionSource || null,
      hasGaClientId: gaClientId.trim().length > 0,
      analyticsConsent: analyticsConsent === "true",
    });

    const referralCode = await generateUniqueReferralCode();
    const registryCode = await generateUniqueRegistryCode();
    const accessToken = generateAccessToken();
    const memberId = generateMemberId();

    const newMember = await createMember({
      id: memberId,
      registryCode,
      name: name.trim(),
      tier,
      date: new Date().toISOString(),
      dedication: dedication.trim(),
      referralCode,
      referredBy: referredBy || undefined,
      email: (email.trim() || recipientEmail.trim()) || undefined,
      stripeSessionId: session.id,
      accessToken,
      template: template || undefined,
      locale,
      termsAcceptedAt: termsAcceptedAt || new Date().toISOString(),
      termsVersion,
      digitalContentConsentAt: digitalContentConsentAt || new Date().toISOString(),
      digitalContentVersion,
      registryVisibility: registryVisibility === "public" ? "public" : "private",
      dedicationReviewStatus:
        dedicationReviewStatus === "rejected" ? "rejected" : "approved",
    });

    console.log("[SHA Webhook] Member created", {
      memberId: newMember.id,
      sessionId: session.id,
      referralCode,
      targetLocale: locale,
    });

    if (referredBy) {
      await incrementReferralCount(referredBy);
    }

    if (analyticsConsent === "true" && gaClientId.trim()) {
      const amountTotal =
        typeof session.amount_total === "number"
          ? session.amount_total / 100
          : undefined;
      const gaResult = await sendGa4PurchaseEvent({
        clientId: gaClientId,
        transactionId: session.id,
        tier,
        value: amountTotal,
        currency: (session.currency || "usd").toUpperCase(),
        source: attributionSource,
        locale,
        isGift: isGift === "true",
      });
      console.log("[SHA Webhook] GA4 purchase tracking processed", {
        sessionId: session.id,
        sent: gaResult.sent,
        reason: "reason" in gaResult ? gaResult.reason : undefined,
      });
    }

    // Send certificate email (link only)
    const targetEmail = isGift === "true" && recipientEmail ? recipientEmail : email;
    const normalizedPaperFormat = normalizePaperFormatForTemplate(
      template,
      paperFormat,
    );
    // Accept both modern (playful/classic/luxury) and legacy (hero/formal)
    // template IDs — older Stripe metadata may still carry the old names.
    const templateQuery = getCertificateTemplateQueryParam(template);
    const certificateUrl = buildAbsoluteLocalizedUrl(
      BASE_URL,
      locale,
      `/certificate/view?token=${accessToken}&paper=${normalizedPaperFormat}${templateQuery}&download=1`
    );
    const giftRevealUrl =
      isGift === "true"
        ? buildAbsoluteLocalizedUrl(
            BASE_URL,
            locale,
            `/gift?to=${encodeURIComponent(name.trim())}${fromName ? `&from=${encodeURIComponent(fromName.trim())}` : ""}${giftMessage ? `&msg=${encodeURIComponent(giftMessage.slice(0, 600))}` : ""}&token=${accessToken}`,
          )
        : undefined;

    logEmailRouteEntered({
      flow: "webhook-certificate",
      route: "/api/webhook",
      recipient: targetEmail,
      memberId: newMember.id,
      sessionId: session.id,
      tier,
      locale,
    });

    if (targetEmail && process.env.RESEND_API_KEY) {
      try {
        await sendEmailStrict(
          {
            from: EMAIL_FROM,
            to: targetEmail,
            subject: certificateEmailSubject({ name, locale }),
            html: certificateEmailHtml({
              name,
              tier,
              registryId: newMember.registryCode || formatRegistryIdForDisplay(newMember.id),
              referralCode,
              downloadUrl: certificateUrl,
              registryUrl:
                newMember.registryVisibility === "public"
                  ? buildAbsoluteLocalizedUrl(BASE_URL, locale, `/registry?highlight=${encodeURIComponent(newMember.registryCode || formatRegistryIdForDisplay(newMember.id))}`)
                  : undefined,
              careerUrl: buildAbsoluteLocalizedUrl(BASE_URL, locale, "/career"),
              referralUrl: buildAbsoluteLocalizedUrl(BASE_URL, locale, buildReferralHref(referralCode)),
              termsUrl: buildAbsoluteLocalizedUrl(BASE_URL, locale, "/terms"),
              manageUrl: buildAbsoluteLocalizedUrl(
                BASE_URL,
                locale,
                `/certificate/view?token=${accessToken}#record-controls`
              ),
              giftMessage: giftMessage || undefined,
              fromName:
                isGift === "true" && fromName ? fromName.trim() : undefined,
              revealUrl: giftRevealUrl,
              isGift: isGift === "true",
              locale,
            }),
          },
          {
            flow: "webhook-certificate",
            route: "/api/webhook",
            recipient: targetEmail,
            memberId: newMember.id,
            sessionId: session.id,
            tier,
            locale,
          }
        );
        console.log("[SHA Webhook] Certificate email sent", {
          memberId: newMember.id,
          sessionId: session.id,
          tier,
          hasRecipient: true,
        });
      } catch (emailError) {
        console.error("[SHA Webhook] Certificate email failed after retries", {
          memberId: newMember.id,
          sessionId: session.id,
          hasRecipient: true,
          tier,
          error: emailError instanceof Error ? emailError.message : String(emailError),
        });
      }
    } else {
      console.warn("[SHA Webhook] Certificate email skipped", {
        reason: targetEmail ? "missing-resend-api-key" : "missing-target-email",
        hasApiKey: !!process.env.RESEND_API_KEY,
        hasTargetEmail: !!targetEmail,
        memberId: newMember.id,
        sessionId: session.id,
      });
    }

    // Also notify buyer if gift
    if (isGift === "true" && recipientEmail && email && email !== recipientEmail && process.env.RESEND_API_KEY) {
      try {
        const careerUrl = buildAbsoluteLocalizedUrl(BASE_URL, locale, "/career");
        await sendEmailStrict(
          {
            from: EMAIL_FROM,
            to: email,
            subject: giftBuyerNotificationSubject({ name, tier, locale }),
            html: giftBuyerNotificationEmailHtml({
              name,
              recipientEmail,
              referralCode,
              careerUrl,
              giftMessage: giftMessage || undefined,
              revealUrl: giftRevealUrl,
              locale,
            }),
          },
          {
            flow: "webhook-buyer-notification",
            route: "/api/webhook",
            recipient: email,
            memberId: newMember.id,
            sessionId: session.id,
            tier,
            locale,
          }
        );
      } catch (buyerEmailError) {
        console.error("[SHA Webhook] Buyer notification failed after retries", {
          memberId: newMember.id,
          sessionId: session.id,
          hasRecipient: true,
          error: buyerEmailError instanceof Error ? buyerEmailError.message : String(buyerEmailError),
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
