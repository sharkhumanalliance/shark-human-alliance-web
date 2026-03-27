import { buildAbsoluteLocalizedUrl, buildReferralHref } from "@/lib/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getResend, EMAIL_FROM, certificateEmailHtml } from "@/lib/email";
import { getMemberById } from "@/lib/members";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { to, name, tier, memberId, referralCode } = body;

  if (!to || !name || !tier) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("[SHA Email] RESEND_API_KEY not set — skipping email send");
    return NextResponse.json({
      success: true,
      message: "Email sending not configured (no API key).",
    });
  }

  try {
    const member = await getMemberById(memberId);

    if (!member?.accessToken) {
      return NextResponse.json(
        { error: "Member not found or certificate not available" },
        { status: 404 }
      );
    }

    const locale = member.locale || "en";
    const certificateUrl = buildAbsoluteLocalizedUrl(BASE_URL, locale, `/certificate/view?token=${member.accessToken}`);
    const badgeUrl = member.tier === "nonsnack" ? `${BASE_URL}/api/badge?token=${member.accessToken}&download=1` : undefined;

    await getResend().emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Your Alliance Certificate — Welcome, ${name}!`,
      html: certificateEmailHtml({
        name,
        tier,
        registryId: (memberId || "SHA-XXXX").toUpperCase(),
        referralCode: referralCode || "",
        downloadUrl: certificateUrl,
        registryUrl: buildAbsoluteLocalizedUrl(BASE_URL, locale, `/registry?highlight=${memberId}`),
        careerUrl: buildAbsoluteLocalizedUrl(BASE_URL, locale, "/career"),
        referralUrl: buildAbsoluteLocalizedUrl(BASE_URL, locale, buildReferralHref(referralCode || "")),
        badgeUrl,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SHA Email] Send failed:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
