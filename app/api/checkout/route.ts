import { buildAbsoluteLocalizedUrl, buildReferralHref } from "@/lib/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getStripe, TIER_PRICES, TIER_NAMES } from "@/lib/stripe";
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
  generateAccessToken,
  createMember,
  incrementReferralCount,
  type Member,
} from "@/lib/members";
import { shouldUseDemoMembers } from "@/lib/demo-members";
import { saveDevPromoMember } from "@/lib/dev-promo-store";
import {
  DedicationModerationError,
  moderateDedication,
} from "@/lib/dedication-moderation";
import { DIGITAL_CONTENT_VERSION, TERMS_VERSION } from "@/lib/legal";
import {
  createSignedCheckoutSessionValue,
  getCheckoutSessionCookieName,
} from "@/lib/checkout-session";
import { BASE_URL } from "@/lib/config";
import { getCertificateTemplateQueryParam } from "@/lib/certificate-templates";
import { isTierKey } from "@/lib/tiers";
const ENABLE_TEST_PROMO_CODES =
  process.env.ENABLE_TEST_PROMO_CODES === "true" ||
  process.env.NODE_ENV !== "production";

/** Promo codes that bypass Stripe entirely (100% off). */
const FREE_PROMO_CODES = ["SHATEST"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tier,
      name,
      dedication,
      email,
      isGift,
      recipientEmail,
      referredBy,
      locale,
      promoCode,
      template,
      paperFormat = "a4",
      giftMessage = "",
      termsAccepted,
      digitalContentConsentAccepted,
      registryConsentAccepted,
    } = body;

    const loc = locale || "en";
    const requestHost = request.nextUrl.hostname.toLowerCase();
    const isLocalRequest =
      requestHost === "127.0.0.1" ||
      requestHost === "localhost" ||
      requestHost.endsWith(".local");
    const allowLocalPromoFallback = shouldUseDemoMembers() || isLocalRequest;
    const normalizedPromoCode = promoCode?.toUpperCase().trim() || "";
    // Free promo codes are gated solely by ENABLE_TEST_PROMO_CODES (or non-production NODE_ENV).
    // Hostname checks are intentionally NOT used here to prevent DNS-rebinding bypass.
    const isFreePromoFlow = normalizedPromoCode
      ? ENABLE_TEST_PROMO_CODES &&
        FREE_PROMO_CODES.includes(normalizedPromoCode)
      : false;

    console.log("[SHA Checkout] route entered", {
      mode: isFreePromoFlow ? normalizedPromoCode : "stripe",
      hasApiKey: !!process.env.RESEND_API_KEY,
      hasEmailFrom: !!EMAIL_FROM,
      tier: tier ?? null,
      hasName: typeof name === "string" && name.trim().length > 0,
      hasEmail: typeof email === "string" && email.trim().length > 0,
      hasRecipientEmail:
        typeof recipientEmail === "string" && recipientEmail.trim().length > 0,
      isGift: !!isGift,
      locale: loc,
      template: template || null,
      paperFormat: paperFormat === "letter" ? "letter" : "a4",
      hasReferral: typeof referredBy === "string" && referredBy.trim().length > 0,
    });

    if (!isTierKey(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!termsAccepted) {
      return NextResponse.json(
        { error: "Terms consent is required", code: "terms_required" },
        { status: 400 }
      );
    }
    if (!digitalContentConsentAccepted) {
      return NextResponse.json(
        {
          error: "Digital content consent is required",
          code: "digital_content_consent_required",
        },
        { status: 400 }
      );
    }

    let moderatedDedication = "";
    let dedicationReviewStatus: "approved" | "rejected" = "approved";
    const registryVisibility: Member["registryVisibility"] =
      registryConsentAccepted ? "public" : "private";
    try {
      const moderation = moderateDedication(dedication);
      moderatedDedication = moderation.dedication;
      dedicationReviewStatus = moderation.reviewStatus;
    } catch (error) {
      if (error instanceof DedicationModerationError) {
        return NextResponse.json(
          {
            error: "Dedication could not be accepted",
            code: error.code,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // ─── Free promo code: skip Stripe, register member directly ───
    if (isFreePromoFlow) {
      const freeSessionId = `promo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const accessToken = generateAccessToken();
      const fallbackReferralCode = `SHA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      let referralCode = fallbackReferralCode;

      try {
        referralCode = await generateUniqueReferralCode();
      } catch (error) {
        if (!allowLocalPromoFallback) {
          throw error;
        }
        console.warn("[SHA Checkout] Falling back to local promo referral code", {
          requestHost,
          error,
        });
      }

      const memberDraft = {
        id: generateMemberId(),
        name: name.trim(),
        tier,
        date: new Date().toISOString(),
        dedication: moderatedDedication,
        referralCode,
        referredBy: referredBy || undefined,
        email: (email?.trim() || recipientEmail?.trim()) || undefined,
        stripeSessionId: freeSessionId,
        accessToken,
        template: template || undefined,
        locale: loc,
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: TERMS_VERSION,
        digitalContentConsentAt: new Date().toISOString(),
        digitalContentVersion: DIGITAL_CONTENT_VERSION,
        registryVisibility,
        dedicationReviewStatus,
      };

      let newMember;
      try {
        newMember = await createMember(memberDraft);

        if (referredBy) {
          await incrementReferralCount(referredBy);
        }
      } catch (error) {
        if (!allowLocalPromoFallback) {
          throw error;
        }

        console.warn("[SHA Checkout] Falling back to in-memory promo member store", {
          requestHost,
          error,
        });
        newMember = {
          ...memberDraft,
          referralCount: 0,
        };
        saveDevPromoMember(freeSessionId, newMember);
      }

      const targetEmail = isGift && recipientEmail ? recipientEmail.trim() : email?.trim();
      const normalizedPaperFormat = paperFormat === "letter" ? "letter" : "a4";
      const templateQuery = getCertificateTemplateQueryParam(template);
      const certificateUrl = buildAbsoluteLocalizedUrl(
        BASE_URL,
        loc,
        `/certificate/view?token=${accessToken}&paper=${normalizedPaperFormat}${templateQuery}&download=1`
      );

      logEmailRouteEntered({
        flow: "checkout-promo-certificate",
        route: "/api/checkout",
        recipient: targetEmail,
        memberId: newMember.id,
        sessionId: freeSessionId,
        tier,
        locale: loc,
      });

      if (targetEmail && process.env.RESEND_API_KEY) {
        try {
          await sendEmailStrict(
            {
              from: EMAIL_FROM,
              to: targetEmail,
              subject: certificateEmailSubject({ name, locale: loc }),
              html: certificateEmailHtml({
                name,
                tier,
                registryId: newMember.id.toUpperCase(),
                referralCode,
                downloadUrl: certificateUrl,
                registryUrl:
                  newMember.registryVisibility === "public"
                    ? buildAbsoluteLocalizedUrl(BASE_URL, loc, `/registry?highlight=${newMember.id}`)
                    : undefined,
                careerUrl: buildAbsoluteLocalizedUrl(BASE_URL, loc, "/career"),
                referralUrl: buildAbsoluteLocalizedUrl(BASE_URL, loc, buildReferralHref(referralCode)),
                termsUrl: buildAbsoluteLocalizedUrl(BASE_URL, loc, "/terms"),
                manageUrl: buildAbsoluteLocalizedUrl(
                  BASE_URL,
                  loc,
                  `/certificate/view?token=${accessToken}#record-controls`
                ),
                giftMessage: giftMessage || undefined,
                isGift,
                locale: loc,
              }),
            },
            {
              flow: "checkout-promo-certificate",
              route: "/api/checkout",
              recipient: targetEmail,
              memberId: newMember.id,
              sessionId: freeSessionId,
              tier,
              locale: loc,
            }
          );
          console.log("[SHA Checkout] Promo certificate email sent", {
            memberId: newMember.id,
            sessionId: freeSessionId,
            tier,
            hasRecipient: true,
          });
        } catch (emailError) {
          console.error("[SHA Checkout] Promo email send failed:", emailError);
        }
      } else {
        console.warn("[SHA Checkout] Promo certificate email skipped", {
          reason: targetEmail ? "missing-resend-api-key" : "missing-target-email",
          hasApiKey: !!process.env.RESEND_API_KEY,
          hasTargetEmail: !!targetEmail,
          memberId: newMember.id,
          sessionId: freeSessionId,
        });
      }

      if (isGift && recipientEmail && email && email.trim() !== recipientEmail.trim() && process.env.RESEND_API_KEY) {
        try {
          const careerUrl = buildAbsoluteLocalizedUrl(BASE_URL, loc, "/career");
          await sendEmailStrict(
            {
              from: EMAIL_FROM,
              to: email.trim(),
              subject: giftBuyerNotificationSubject({
                name,
                tier,
                locale: loc,
              }),
              html: giftBuyerNotificationEmailHtml({
                name,
                recipientEmail,
                referralCode,
                careerUrl,
                giftMessage: giftMessage || undefined,
                locale: loc,
              }),
            },
            {
              flow: "checkout-promo-buyer-notification",
              route: "/api/checkout",
              recipient: email.trim(),
              memberId: newMember.id,
              sessionId: freeSessionId,
              tier,
              locale: loc,
            }
          );
        } catch (emailError) {
          console.error("[SHA Checkout] Promo buyer notification failed:", emailError);
        }
      }

      console.log("[SHA Checkout] Promo code used", {
        promoCode: normalizedPromoCode,
        memberId: newMember.id,
        sessionId: freeSessionId,
        tier,
      });

      const successUrl = `/${loc}/purchase/success?session_id=${freeSessionId}&paper=${normalizedPaperFormat}`;
      const response = NextResponse.json({ url: successUrl });
      response.cookies.set({
        name: getCheckoutSessionCookieName(),
        value: createSignedCheckoutSessionValue(freeSessionId),
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 30,
      });
      return response;
    }

    // ─── Normal Stripe Checkout ───
    const priceInCents = TIER_PRICES[tier];
    const tierName = TIER_NAMES[tier];

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email || undefined,
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tierName} — Shark Human Alliance`,
              description: `Personalized certificate for ${name}. Every sale funds real shark conservation.`,
              images: [`${BASE_URL}/mascots/homepage-hero-plush.png`],
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${BASE_URL}/${loc}/purchase/success?session_id={CHECKOUT_SESSION_ID}&paper=${paperFormat === "letter" ? "letter" : "a4"}`,
      cancel_url: `${BASE_URL}/${loc}/purchase?tier=${tier}&name=${encodeURIComponent(name)}&canceled=true&paper=${paperFormat === "letter" ? "letter" : "a4"}`,
      metadata: {
        tier,
        name,
        dedication: moderatedDedication,
        email,
        isGift: isGift ? "true" : "false",
        recipientEmail: recipientEmail || "",
        referredBy: referredBy || "",
        locale: loc,
        template: template || "",
        paperFormat: paperFormat === "letter" ? "letter" : "a4",
        giftMessage: giftMessage || "",
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: TERMS_VERSION,
        digitalContentConsentAt: new Date().toISOString(),
        digitalContentVersion: DIGITAL_CONTENT_VERSION,
        registryVisibility: registryConsentAccepted ? "public" : "private",
        dedicationReviewStatus,
      },
    });

    console.log("[SHA Checkout] Stripe session created", {
      sessionId: session.id,
      hasUrl: !!session.url,
      mode: "stripe",
      tier,
      hasName: true,
      hasEmail: typeof email === "string" && email.trim().length > 0,
      hasRecipientEmail:
        typeof recipientEmail === "string" && recipientEmail.trim().length > 0,
      isGift: !!isGift,
      locale: loc,
    });

    const response = NextResponse.json({ url: session.url });
    response.cookies.set({
      name: getCheckoutSessionCookieName(),
      value: createSignedCheckoutSessionValue(session.id),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 30,
    });
    return response;
  } catch (error) {
    console.error("[SHA Checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
