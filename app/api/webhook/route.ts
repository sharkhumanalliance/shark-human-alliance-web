import { buildAbsoluteLocalizedUrl, buildReferralHref } from "@/lib/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getResend, EMAIL_FROM, certificateEmailHtml } from "@/lib/email";
import {
  generateMemberId,
  generateUniqueReferralCode,
  generateAccessToken,
  createMember,
  incrementReferralCount,
  getMemberByStripeSession,
} from "@/lib/members";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com";

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
      paperFormat = "a4",
      giftMessage = "",
    } = meta;

    console.log(`[SHA Webhook] Payment completed for ${name} (${tier})`);

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
      locale,
    });

    if (referredBy) {
      await incrementReferralCount(referredBy);
    }

    // Send certificate email (link only)
    const targetEmail = isGift === "true" && recipientEmail ? recipientEmail : email;
    const certificateUrl = buildAbsoluteLocalizedUrl(BASE_URL, locale, `/certificate/view?token=${accessToken}&paper=${paperFormat === "letter" ? "letter" : "a4"}`);

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
            registryUrl: buildAbsoluteLocalizedUrl(BASE_URL, locale, `/registry?highlight=${newMember.id}`),
            careerUrl: buildAbsoluteLocalizedUrl(BASE_URL, locale, "/career"),
            referralUrl: buildAbsoluteLocalizedUrl(BASE_URL, locale, buildReferralHref(referralCode)),
            giftMessage: giftMessage || undefined,
            isGift: isGift === "true",
          }),
        });
        console.log(`[SHA Webhook] Certificate email sent to ${targetEmail}`);
      } catch (emailError) {
        console.error("[SHA Webhook] Email send failed:", emailError);
      }
    }

    // Also notify buyer if gift
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
      ${giftMessage ? `<br><br><em>Included message:</em> ${giftMessage}` : ""}
    </p>
    <p style="color:#5f7892;font-size:13px;margin-top:16px;">
      Your referral code: <strong>${referralCode}</strong><br>
      Share it with friends to climb the Alliance career ladder!
    </p>
    <a href="${buildAbsoluteLocalizedUrl(BASE_URL, locale, "/career")}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#2f80ed;color:white;text-decoration:none;border-radius:50px;font-weight:600;">View Career Ladder</a>
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
