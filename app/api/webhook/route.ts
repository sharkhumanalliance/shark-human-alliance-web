import { buildAbsoluteLocalizedUrl, buildReferralHref } from "@/lib/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  EMAIL_FROM,
  certificateEmailHtml,
  escapeHtml,
  logEmailRouteEntered,
  sendEmailStrict,
} from "@/lib/email";
import {
  generateMemberId,
  generateUniqueReferralCode,
  generateAccessToken,
  createMember,
  incrementReferralCount,
  getMemberByStripeSession,
} from "@/lib/members";
import { BASE_URL } from "@/lib/config";
import { DIGITAL_CONTENT_VERSION, TERMS_VERSION } from "@/lib/legal";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  let event;

  console.log("[SHA Webhook] route entered", {
    route: "/api/webhook",
    hasSignatureHeader: !!request.headers.get("stripe-signature"),
    hasWebhookSecret: !!WEBHOOK_SECRET,
    hasResendApiKey: !!process.env.RESEND_API_KEY,
    emailFrom: EMAIL_FROM,
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
      termsAcceptedAt = "",
      termsVersion = TERMS_VERSION,
      digitalContentConsentAt = "",
      digitalContentVersion = DIGITAL_CONTENT_VERSION,
      registryVisibility = "private",
      dedicationReviewStatus = "approved",
    } = meta;

    console.log("[SHA Webhook] checkout.session.completed received", {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      tier,
      name,
      email: email || null,
      recipientEmail: recipientEmail || null,
      isGift,
      locale,
      paperFormat,
      referredBy: referredBy || null,
    });

    const referralCode = await generateUniqueReferralCode();
    const accessToken = generateAccessToken();

    const newMember = await createMember({
      id: generateMemberId(),
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

    // Send certificate email (link only)
    const targetEmail = isGift === "true" && recipientEmail ? recipientEmail : email;
    const normalizedPaperFormat = paperFormat === "letter" ? "letter" : "a4";
    const certificateUrl = buildAbsoluteLocalizedUrl(BASE_URL, locale, `/certificate/view?token=${accessToken}&paper=${normalizedPaperFormat}`);

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
            subject: `Your Alliance Certificate — Welcome, ${name}!`,
            html: certificateEmailHtml({
              name,
              tier,
              registryId: newMember.id.toUpperCase(),
              referralCode,
              downloadUrl: certificateUrl,
              registryUrl:
                newMember.registryVisibility === "public"
                  ? buildAbsoluteLocalizedUrl(BASE_URL, locale, `/registry?highlight=${newMember.id}`)
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
              isGift: isGift === "true",
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
        console.log(`[SHA Webhook] Certificate email sent to ${targetEmail}`);
      } catch (emailError) {
        console.error("[SHA Webhook] Certificate email failed after retries", {
          memberId: newMember.id,
          sessionId: session.id,
          recipient: targetEmail,
          tier,
          error: emailError instanceof Error ? emailError.message : String(emailError),
        });
      }
    } else {
      console.warn("[SHA Webhook] Certificate email skipped", {
        reason: targetEmail ? "missing-resend-api-key" : "missing-target-email",
        hasApiKey: !!process.env.RESEND_API_KEY,
        targetEmail: targetEmail || null,
        memberId: newMember.id,
        sessionId: session.id,
      });
    }

    // Also notify buyer if gift
    if (isGift === "true" && recipientEmail && email && email !== recipientEmail && process.env.RESEND_API_KEY) {
      try {
        const safeName = escapeHtml(name);
        const safeRecipientEmail = escapeHtml(recipientEmail);
        const safeReferralCode = escapeHtml(referralCode);
        const safeGiftMessage = giftMessage
          ? escapeHtml(giftMessage).replace(/\r?\n/g, "<br>")
          : "";
        const safeCareerUrl = escapeHtml(
          buildAbsoluteLocalizedUrl(BASE_URL, locale, "/career")
        );
        await sendEmailStrict(
          {
            from: EMAIL_FROM,
            to: email,
            subject: `Gift sent! ${name} is now a ${tier === "nonsnack" ? "Certified Non-Snack" : "Protected Friend"}`,
            html: `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f5fbff;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background:white;border-radius:24px;padding:32px;text-align:center;border:1px solid #d4e8f7;">
    <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#64748b;">Gift</div>
    <h1 style="color:#15324d;font-size:24px;margin:16px 0 8px;">Gift Delivered!</h1>
    <p style="color:#5f7892;font-size:14px;line-height:1.6;">
      Your gift for <strong>${safeName}</strong> has been sent to <strong>${safeRecipientEmail}</strong>.
      They'll receive their certificate and a warm welcome from the Alliance.
      ${safeGiftMessage ? `<br><br><em>Included message:</em> ${safeGiftMessage}` : ""}
    </p>
    <p style="color:#5f7892;font-size:13px;margin-top:16px;">
      Your referral code: <strong>${safeReferralCode}</strong><br>
      Share it with friends to climb the Alliance career ladder!
    </p>
    <a href="${safeCareerUrl}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#2f80ed;color:white;text-decoration:none;border-radius:50px;font-weight:600;">View Career Ladder</a>
  </div>
  <p style="text-align:center;color:#5f7892;font-size:11px;margin-top:16px;">&copy; 2026 Shark Human Alliance</p>
</div>
</body></html>`,
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
          recipient: email,
          error: buyerEmailError instanceof Error ? buyerEmailError.message : String(buyerEmailError),
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
