import { NextRequest, NextResponse } from "next/server";
import { getStripe, TIER_PRICES, TIER_NAMES } from "@/lib/stripe";
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
      giftMessage,
      referredBy,
      locale,
      promoCode,
      template,
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

      const newMember = await createMember({
        id: generateMemberId(),
        name: name.trim(),
        tier,
        date: new Date().toISOString(),
        dedication: (dedication || "").trim(),
        referralCode,
        referredBy: referredBy || undefined,
        email: email ? email.trim() : undefined,
        stripeSessionId: freeSessionId,
        accessToken: generateAccessToken(),
        template: template || undefined,
        locale: loc,
      });

      if (referredBy) {
        await incrementReferralCount(referredBy);
      }

      console.log(`[SHA Checkout] Promo code ${promoCode} used — free registration for ${newMember.name}`);

      const successUrl = `/${loc}/purchase/success?session_id=${freeSessionId}`;
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
      success_url: `${BASE_URL}/${loc}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/${loc}/purchase?tier=${tier}&name=${encodeURIComponent(name)}&canceled=true`,
      metadata: {
        tier,
        name,
        dedication: dedication || "",
        email,
        isGift: isGift ? "true" : "false",
        recipientEmail: recipientEmail || "",
        giftMessage: typeof giftMessage === "string" ? giftMessage.slice(0, 400) : "",
        referredBy: referredBy || "",
        locale: loc,
        template: template || "",
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
