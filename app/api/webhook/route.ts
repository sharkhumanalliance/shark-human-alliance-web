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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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

    const existing = await getMemberByStripeSession(session.id);
    if (existing) {
      console.log(
        `[SHA Webhook] Duplicate delivery for session ${session.id} — skipping`
      );
      return NextResponse.json({ received: true });
    }

    const meta = session.metadata || {};

    const {
      tier = "protected",
      name = "Unknown",
      dedication = "",
      email = "",
      isGift = "false",
      recipientEmail = "",
      giftMessage = "",
      referredBy = "",
      locale = "en",
      template = "",
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
      template: template || undefined,
      locale,
    });

    if (referredBy) {
      await incrementReferralCount(referredBy);
    }

    const targetEmail = isGift === "true" && recipientEmail ? recipientEmail : email;
    const templateParam = template ? `&template=${encodeURIComponent(template)}` : "";
    const certificateUrl = buildAbsoluteLocalizedUrl(
      BASE_URL,
      locale,
      `/certificate/view?token=${accessToken}${templateParam}`
    );
    const badgeUrl = tier === "nonsnack" ? `${BASE_URL}/api/badge?token=${accessToken}&download=1` : undefined;

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
            badgeUrl,
            giftMessage: giftMessage || undefined,
          }),
        });
        console.log(`[SHA Webhook] Certificate email sent to ${targetEmail}`);
      } catch (emailError) {
        console.error("[SHA Webhook] Email send failed:", emailError);
      }
    }

    if (isGift === "true" && recipientEmail && email && email !== recipientEmail && process.env.RESEND_API_KEY) {
      try {
        const safeName = escapeHtml(name);
        const safeRecipientEmail = escapeHtml(recipientEmail);
        const safeGiftMessage = giftMessage ? escapeHtml(giftMessage) : "";
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
      Your gift for <strong>${safeName}</strong> has been sent to <strong>${safeRecipientEmail}</strong>.
      They'll receive their certificate and a warm welcome from the Alliance.
    </p>
    ${giftMessage ? `<p style="margin:16px auto 0;max-width:420px;padding:14px 16px;background:#fff7ed;border:1px solid #fdba74;border-radius:16px;color:#7c2d12;font-size:13px;line-height:1.6;"><strong style="display:block;margin-bottom:6px;color:#c2410c;">Your note</strong>${safeGiftMessage}</p>` : ""}
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
