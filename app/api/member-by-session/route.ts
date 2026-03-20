import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "members.json");

interface Member {
  id: string;
  name: string;
  tier: string;
  date: string;
  dedication: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  email?: string;
  stripeSessionId?: string;
}

async function readMembers(): Promise<Member[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * GET /api/member-by-session?session_id=cs_xxx
 * Returns the member registered by the given Stripe session.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const members = await readMembers();
  const member = members.find((m) => m.stripeSessionId === sessionId);

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
  });
}
