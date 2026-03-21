import { NextRequest, NextResponse } from "next/server";
import { getStripe, TIER_PRICES, TIER_NAMES } from "@/lib/stripe";
import fs from "fs/promises";
import path from "path";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com";
const DATA_PATH = path.join(process.cwd(), "data", "members.json");

/** Promo codes that bypass Stripe entirely (100% off). */
const FREE_PROMO_CODES = ["SHATEST"];

interface Member {
  id: string;
  name: string;
  tier: string;
  date: string;
  dedication: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  email?: string;
  stripeSessionId?: string;
}

async function readMembers(): Promise<Member[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeMembers(members: Member[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(members, null, 2), "utf-8");
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SHA-${code}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, name, dedication, email, isGift, recipientEmail, referredBy, locale, promoCode } = body;

    if (!tier || !TIER_PRICES[tier]) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const loc = locale || "en";

    // ─── Free promo code: skip Stripe, register member directly ───
    if (promoCode && FREE_PROMO_CODES.includes(promoCode.toUpperCase().trim())) {
      const members = await readMembers();

      let referralCode = generateReferralCode();
      while (members.some((m) => m.referralCode === referralCode)) {
        referralCode = generateReferralCode();
      }

      const freeSessionId = `promo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const newMember: Member = {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: name.trim(),
        tier,
        date: new Date().toISOString().split("T")[0],
        dedication: (dedication || "").trim(),
        referralCode,
        referralCount: 0,
        email: email ? email.trim() : undefined,
        stripeSessionId: freeSessionId,
      };

      if (referredBy) {
        newMember.referredBy = referredBy;
        const referrer = members.find((m) => m.referralCode === referredBy);
        if (referrer) {
          referrer.referralCount += 1;
        }
      }

      members.push(newMember);
      await writeMembers(members);

      console.log(`[SHA Checkout] Promo code ${promoCode} used — free registration for ${name}`);

      // Use relative URL so it works in both dev and production
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
              images: [`${BASE_URL}/mascots/finnley-luna-hero.png`],
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
        referredBy: referredBy || "",
        locale: loc,
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
