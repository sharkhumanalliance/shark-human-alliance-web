import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "members.json");

export type Member = {
  id: string;
  name: string;
  tier: "basic" | "protected" | "nonsnack" | "business";
  date: string;
  dedication: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  email?: string;
};

async function readMembers(): Promise<Member[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeMembers(members: Member[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(members, null, 2), "utf-8");
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SHA-${code}`;
}

async function isReferralCodeUnique(code: string): Promise<boolean> {
  const members = await readMembers();
  return !members.some((m) => m.referralCode === code);
}

async function generateUniqueReferralCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  do {
    code = generateReferralCode();
    isUnique = await isReferralCodeUnique(code);
  } while (!isUnique);
  return code;
}

export async function GET() {
  const members = await readMembers();
  return NextResponse.json(members);
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

  return NextResponse.json(newMember, { status: 201 });
}
