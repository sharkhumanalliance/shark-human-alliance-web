import { NextRequest, NextResponse } from "next/server";
import {
  listMembers,
  createMember,
  generateMemberId,
  generateUniqueReferralCode,
  generateAccessToken,
  getMemberByReferralCode,
  incrementReferralCount,
} from "@/lib/members";

export async function GET() {
  const members = await listMembers();
  // Strip sensitive fields from public response
  const publicMembers = members.map(
    ({ accessToken, stripeSessionId, email, template, locale, ...rest }) => rest
  );
  return NextResponse.json(publicMembers);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, tier, dedication, referredBy, email } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!["basic", "protected", "nonsnack", "business"].includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  // Validate referral code before creating member
  if (referredBy && typeof referredBy === "string") {
    const referrer = await getMemberByReferralCode(referredBy.trim());
    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      );
    }
  }

  const referralCode = await generateUniqueReferralCode();

  const newMember = await createMember({
    id: generateMemberId(),
    name: name.trim(),
    tier,
    date: new Date().toISOString(),
    dedication: (dedication || "").trim(),
    referralCode,
    referredBy: referredBy ? referredBy.trim() : undefined,
    email: email && typeof email === "string" ? email.trim() : undefined,
    accessToken: generateAccessToken(),
  });

  if (referredBy) {
    await incrementReferralCount(referredBy.trim());
  }

  // Don't expose accessToken in POST response
  const { accessToken, ...publicMember } = newMember;
  return NextResponse.json(publicMember, { status: 201 });
}
