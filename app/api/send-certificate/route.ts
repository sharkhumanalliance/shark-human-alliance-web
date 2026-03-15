import { NextRequest, NextResponse } from "next/server";

// TODO: Connect real email service (e.g. Resend, SendGrid, or Gmail SMTP)
// Sender: sharkhumanalliance@gmail.com

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { to, name, tier, dedication, memberId } = body;

  if (!to || !name || !tier) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // For now, just log and return success
  // When email service is connected, this will:
  // 1. Generate the PDF certificate
  // 2. Attach it to an email
  // 3. Send from sharkhumanalliance@gmail.com
  console.log(`[EMAIL PLACEHOLDER] Would send certificate to: ${to}`);
  console.log(`  Name: ${name}, Tier: ${tier}, Dedication: ${dedication}, ID: ${memberId}`);

  return NextResponse.json({
    success: true,
    message: "Email sending is not yet configured. Certificate was generated successfully.",
  });
}
