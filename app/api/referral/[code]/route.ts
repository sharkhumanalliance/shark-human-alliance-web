import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getRank } from "@/lib/referral-ranks";

const DATA_PATH = path.join(process.cwd(), "data", "members.json");

interface Member {
  id: string;
  name: string;
  tier: "basic" | "protected" | "nonsnack" | "business";
  date: string;
  dedication: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  email?: string;
}

async function readMembers(): Promise<Member[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

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
