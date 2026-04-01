import { buildAbsoluteLocalizedUrl, buildReferralHref } from "@/lib/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getStripe, TIER_PRICES, TIER_NAMES } from "@/lib/stripe";
import { getResend, EMAIL_FROM, certificateEmailHtml } from "@/lib/email";
import {
  generateMemberId,
  generateUniqueReferralCode,
  generateAccessToken,
  createMember,
  incrementReferralCount,
} from "@/lib/members";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com";

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

    if (!tier || !TIER_PRICES[tier]) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const loc = locale || "en";

    // ─── Free promo code: skip Stripe, register member directly ───
    if (promoCode && FREE_PROMO_CODES.includes(promoCode.toUpperCase().trim())) {
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
      const certificateUrl = buildAbsoluteLocalizedUrl(
        BASE_URL,
        loc,
        `/certificate/view?token=${accessToken}&paper=${paperFormat === "letter" ? "letter" : "a4"}`
      );

      if (targetEmail && process.env.RESEND_API_KEY) {
        try {
          await getResend().emails.send({
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
          });
          console.log(`[SHA Checkout] Promo certificate email sent to ${targetEmail}`);
        } catch (emailError) {
          console.error("[SHA Checkout] Promo email send failed:", emailError);
        }
      }

      if (isGift && recipientEmail && email && email.trim() !== recipientEmail.trim() && process.env.RESEND_API_KEY) {
        try {
          await getResend().emails.send({
            from: EMAIL_FROM,
            to: email.trim(),
            subject: `Gift sent! ${name} is now a ${tier === "nonsnack" ? "Certified Non-Snack" : "Protected Friend"}`,
            html: `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f5fbff;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background:white;border-radius:24px;padding:32px;text-align:center;border:1px solid #d4e8f7;">
    <div style="font-size:48px;">🎁</div>
    <h1 style="color:#15324d;font-size:24px;margin:16px 0 8px;">Gift Delivered!</h1>
    <p style="color:#5f7892;font-size:14px;line-height:1.6;">
      Your gift for <strong>${name}</strong> has been sent to <strong>${recipientEmail}</strong>.
      They'll receive their certificate and a warm welcome from the Alliance.
      ${giftMessage ? `<br><br><em>Included message:</em> ${giftMessage}` : ""}
    </p>
    <p style="color:#5f7892;font-size:13px;margin-top:16px;">
      Your referral code: <strong>${referralCode}</strong><br>
      Share it with friends to climb the Alliance career ladder!
    </p>
    <a href="${buildAbsoluteLocalizedUrl(BASE_URL, loc, "/career")}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#2f80ed;color:white;text-decoration:none;border-radius:50px;font-weight:600;">View Career Ladder</a>
  </div>
  <p style="text-align:center;color:#5f7892;font-size:11px;margin-top:16px;">&copy; 2026 Shark Human Alliance</p>
</div>
</body></html>`,
          });
        } catch (emailError) {
          console.error("[SHA Checkout] Promo buyer notification failed:", emailError);
        }
      }

      console.log(`[SHA Checkout] Promo code ${promoCode} used — free registration for ${newMember.name}`);

      const successUrl = `/${loc}/purchase/success?session_id=${freeSessionId}&paper=${paperFormat === "letter" ? "letter" : "a4"}`;
      return NextResponse.json({ url: successUrl });
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
              images: [`${BASE_URL}/mascots/finnley-luna-hero.webp`],
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

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[SHA Checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
