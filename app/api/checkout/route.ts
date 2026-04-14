import { buildAbsoluteLocalizedUrl, buildReferralHref } from "@/lib/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getStripe, TIER_PRICES, TIER_NAMES } from "@/lib/stripe";
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
} from "@/lib/members";
import {
  createSignedCheckoutSessionValue,
  getCheckoutSessionCookieName,
} from "@/lib/checkout-session";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com";
const ENABLE_TEST_PROMO_CODES = process.env.ENABLE_TEST_PROMO_CODES === "true";

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
    } = body;

    const loc = locale || "en";
    const normalizedPromoCode = promoCode?.toUpperCase().trim() || "";
    const isFreePromoFlow = normalizedPromoCode
      ? ENABLE_TEST_PROMO_CODES &&
        FREE_PROMO_CODES.includes(normalizedPromoCode)
      : false;

    console.log("[SHA Checkout] route entered", {
      mode: isFreePromoFlow ? normalizedPromoCode : "stripe",
      hasApiKey: !!process.env.RESEND_API_KEY,
      emailFrom: EMAIL_FROM,
      tier: tier ?? null,
      name: name ?? null,
      email: email ?? null,
      recipientEmail: recipientEmail ?? null,
      isGift: !!isGift,
      locale: loc,
      template: template || null,
      paperFormat: paperFormat === "letter" ? "letter" : "a4",
      referredBy: referredBy || null,
    });

    if (!tier || !TIER_PRICES[tier]) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // ─── Free promo code: skip Stripe, register member directly ───
    if (isFreePromoFlow) {
      const referralCode = await generateUniqueReferralCode();
      const freeSessionId = `promo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const accessToken = generateAccessToken();

      const newMember = await createMember({
        id: generateMemberId(),
        name: name.trim(),
        tier,
        date: new Date().toISOString(),
        dedication: (dedication || "").trim(),
        referralCode,
        referredBy: referredBy || undefined,
        email: (email?.trim() || recipientEmail?.trim()) || undefined,
        stripeSessionId: freeSessionId,
        accessToken,
        template: template || undefined,
        locale: loc,
      });

      if (referredBy) {
        await incrementReferralCount(referredBy);
      }

      const targetEmail = isGift && recipientEmail ? recipientEmail.trim() : email?.trim();
      const normalizedPaperFormat = paperFormat === "letter" ? "letter" : "a4";
      const certificateUrl = buildAbsoluteLocalizedUrl(
        BASE_URL,
        loc,
        `/certificate/view?token=${accessToken}&paper=${normalizedPaperFormat}`
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
              subject: `Your Alliance Certificate — Welcome, ${name}!`,
              html: certificateEmailHtml({
                name,
                tier,
                registryId: newMember.id.toUpperCase(),
                referralCode,
                downloadUrl: certificateUrl,
                registryUrl: buildAbsoluteLocalizedUrl(BASE_URL, loc, `/registry?highlight=${newMember.id}`),
                careerUrl: buildAbsoluteLocalizedUrl(BASE_URL, loc, "/career"),
                referralUrl: buildAbsoluteLocalizedUrl(BASE_URL, loc, buildReferralHref(referralCode)),
                giftMessage: giftMessage || undefined,
                isGift,
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
          console.log(`[SHA Checkout] Promo certificate email sent to ${targetEmail}`);
        } catch (emailError) {
          console.error("[SHA Checkout] Promo email send failed:", emailError);
        }
      } else {
        console.warn("[SHA Checkout] Promo certificate email skipped", {
          reason: targetEmail ? "missing-resend-api-key" : "missing-target-email",
          hasApiKey: !!process.env.RESEND_API_KEY,
          targetEmail: targetEmail ?? null,
          memberId: newMember.id,
          sessionId: freeSessionId,
        });
      }

      if (isGift && recipientEmail && email && email.trim() !== recipientEmail.trim() && process.env.RESEND_API_KEY) {
        try {
          const safeName = escapeHtml(name);
          const safeRecipientEmail = escapeHtml(recipientEmail);
          const safeReferralCode = escapeHtml(referralCode);
          const safeGiftMessage = giftMessage
            ? escapeHtml(giftMessage).replace(/\r?\n/g, "<br>")
            : "";
          const safeCareerUrl = escapeHtml(
            buildAbsoluteLocalizedUrl(BASE_URL, loc, "/career")
          );
          await sendEmailStrict(
            {
              from: EMAIL_FROM,
              to: email.trim(),
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

      console.log(`[SHA Checkout] Promo code ${normalizedPromoCode} used — free registration for ${newMember.name}`);

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
        dedication: dedication || "",
        email,
        isGift: isGift ? "true" : "false",
        recipientEmail: recipientEmail || "",
        referredBy: referredBy || "",
        locale: loc,
        template: template || "",
        paperFormat: paperFormat === "letter" ? "letter" : "a4",
        giftMessage: giftMessage || "",
      },
    });

    console.log("[SHA Checkout] Stripe session created", {
      sessionId: session.id,
      hasUrl: !!session.url,
      mode: "stripe",
      tier,
      name,
      email: email || null,
      recipientEmail: recipientEmail || null,
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
