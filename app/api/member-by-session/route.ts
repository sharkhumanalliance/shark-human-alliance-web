import { NextRequest, NextResponse } from "next/server";
import { getMemberByStripeSession } from "@/lib/members";

/**
 * GET /api/member-by-session?session_id=cs_xxx
 * Returns the member registered by the given Stripe session.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const member = await getMemberByStripeSession(sessionId);

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: member.id,
    name: member.name,
    tier: member.tier,
    date: member.date,
    dedication: member.dedication,
    referralCode: member.referralCode,
    referralCount: member.referralCount,
    accessToken: member.accessToken,
    email: member.email,
  });
}
