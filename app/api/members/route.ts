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

export async function GET() {
  const members = await readMembers();
  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { name, tier, dedication } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!["basic", "protected", "nonsnack", "business"].includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const newMember: Member = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    tier,
    date: new Date().toISOString().split("T")[0],
    dedication: (dedication || "").trim(),
  };

  const members = await readMembers();
  members.push(newMember);
  await writeMembers(members);

  return NextResponse.json(newMember, { status: 201 });
}
