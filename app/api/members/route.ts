import { NextRequest, NextResponse } from "next/server";
import {
  Member,
  readMembers,
  writeMembers,
  generateReferralCode,
  generateAccessToken,
} from "@/lib/members";

async function generateUniqueReferralCode(): Promise<string> {
  const members = await readMembers();
  let code: string;
  do {
    code = generateReferralCode();
  } while (members.some((m) => m.referralCode === code));
  return code;
}

export async function GET() {
  const members = await readMembers();
  // Strip sensitive fields from public response
  const publicMembers = members.map(({ accessToken, stripeSessionId, email, ...rest }) => rest);
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

  const referralCode = await generateUniqueReferralCode();

  const newMember: Member = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    tier,
    date: new Date().toISOString().split("T")[0],
    dedication: (dedication || "").trim(),
    referralCode,
    referralCount: 0,
    accessToken: generateAccessToken(),
  };

  if (email && typeof email === "string") {
    newMember.email = email.trim();
  }

  if (referredBy && typeof referredBy === "string") {
    newMember.referredBy = referredBy.trim();
  }

  const members = await readMembers();

  // If referredBy is provided, validate it and increment the referrer's count
  if (newMember.referredBy) {
    const referrer = members.find((m) => m.referralCode === newMember.referredBy);
    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      );
    }
    referrer.referralCount += 1;
  }

  members.push(newMember);
  await writeMembers(members);

  // Don't expose accessToken in POST response
  const { accessToken, ...publicMember } = newMember;
  return NextResponse.json(publicMember, { status: 201 });
}
