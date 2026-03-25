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

    const certificateUrl = `${BASE_URL}/en/certificate/view?token=${member.accessToken}`;

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
        registryUrl: `${BASE_URL}/registry?highlight=${memberId}`,
        careerUrl: `${BASE_URL}/career`,
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
