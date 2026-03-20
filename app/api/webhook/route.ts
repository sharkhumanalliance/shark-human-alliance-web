import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getResend, EMAIL_FROM, certificateEmailHtml } from "@/lib/email";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "members.json");
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com";

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

/**
 * Stripe sends webhook events as raw body — we must read it as text, not JSON.
 */
export async function POST(request: NextRequest) {
  let event;

  try {
    const rawBody = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig || !WEBHOOK_SECRET) {
      console.warn("[SHA Webhook] Missing signature or webhook secret");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    event = getStripe().webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[SHA Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata || {};

    const {
      tier = "protected",
      name = "Unknown",
      dedication = "",
      email = "",
      isGift = "false",
      recipientEmail = "",
      referredBy = "",
    } = meta;

    console.log(`[SHA Webhook] Payment completed for ${name} (${tier})`);

    // 1. Register member
    const members = await readMembers();

    // Generate unique referral code
    let referralCode = generateReferralCode();
    while (members.some((m) => m.referralCode === referralCode)) {
      referralCode = generateReferralCode();
    }

    const newMember: Member = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      tier,
      date: new Date().toISOString().split("T")[0],
      dedication: dedication.trim(),
      referralCode,
      referralCount: 0,
      email: email.trim(),
      stripeSessionId: session.id,
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

    // 2. Send certificate email
    const targetEmail = isGift === "true" && recipientEmail ? recipientEmail : email;

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
            downloadUrl: `${BASE_URL}/purchase/success?member=${newMember.id}`,
            registryUrl: `${BASE_URL}/registry?highlight=${newMember.id}`,
            careerUrl: `${BASE_URL}/career`,
          }),
        });
        console.log(`[SHA Webhook] Certificate email sent to ${targetEmail}`);
      } catch (emailError) {
        console.error("[SHA Webhook] Email send failed:", emailError);
        // Don't fail the webhook — payment was successful
      }
    }

    // 3. Also send to buyer if gift
    if (isGift === "true" && recipientEmail && email && email !== recipientEmail && process.env.RESEND_API_KEY) {
      try {
        await getResend().emails.send({
          from: EMAIL_FROM,
          to: email,
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
    </p>
    <p style="color:#5f7892;font-size:13px;margin-top:16px;">
      Your referral code: <strong>${referralCode}</strong><br>
      Share it with friends to climb the Alliance career ladder!
    </p>
    <a href="${BASE_URL}/career" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#2f80ed;color:white;text-decoration:none;border-radius:50px;font-weight:600;">View Career Ladder</a>
  </div>
  <p style="text-align:center;color:#5f7892;font-size:11px;margin-top:16px;">&copy; 2026 Shark Human Alliance</p>
</div>
</body></html>`,
        });
      } catch {
        // Non-critical
      }
    }
  }

  return NextResponse.json({ received: true });
}
