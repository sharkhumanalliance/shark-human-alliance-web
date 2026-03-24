import { NextRequest, NextResponse } from "next/server";
import { readMembers } from "@/lib/members";
import { getRank } from "@/lib/referral-ranks";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const members = await readMembers();

  const member = members.find((m) => m.referralCode === code);

  if (!member) {
    return NextResponse.json(
      { error: "Referral code not found" },
      { status: 404 }
    );
  }

  const rank = getRank(member.referralCount);

  return NextResponse.json({
    name: member.name,
    tier: member.tier,
    referralCode: member.referralCode,
    referralCount: member.referralCount,
    rank,
  });
}
