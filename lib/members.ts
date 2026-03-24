import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const DATA_PATH = path.join(process.cwd(), "data", "members.json");

export interface Member {
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
  /** Public, unguessable token for certificate access URLs. */
  accessToken?: string;
}

export async function readMembers(): Promise<Member[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeMembers(members: Member[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(members, null, 2), "utf-8");
}

export function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SHA-${code}`;
}

/**
 * Generate a cryptographically secure, URL-safe access token.
 * 32 bytes = 64 hex characters — effectively unguessable.
 */
export function generateAccessToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
