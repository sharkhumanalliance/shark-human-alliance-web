import { NextRequest, NextResponse } from "next/server";
import { getMemberByStripeSession } from "@/lib/members";
import { shouldUseDemoMembers } from "@/lib/demo-members";
import { getDevPromoMemberBySession } from "@/lib/dev-promo-store";
import {
  getCheckoutSessionCookieName,
  isValidSignedCheckoutSessionValue,
} from "@/lib/checkout-session";

/**
 * GET /api/member-by-session?session_id=cs_xxx
 * Returns the member registered by the given Stripe session.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const requestHost = request.nextUrl.hostname.toLowerCase();
  const allowLocalPromoFallback =
    shouldUseDemoMembers() ||
    requestHost === "127.0.0.1" ||
    requestHost === "localhost" ||
    requestHost.endsWith(".local");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const signedCookie = request.cookies.get(
    getCheckoutSessionCookieName()
  )?.value;

  if (!isValidSignedCheckoutSessionValue(signedCookie, sessionId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let member = null;
  try {
    member = await getMemberByStripeSession(sessionId);
  } catch (error) {
    if (!allowLocalPromoFallback) {
      throw error;
    }
  }

  if (!member && allowLocalPromoFallback) {
    member = getDevPromoMemberBySession(sessionId);
  }

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
    hasEmail: !!member.email,
    registryVisibility: member.registryVisibility,
  });
}
