import crypto from "crypto";
import { query, queryOne } from "./db";

export type RegistryVisibility = "public" | "private";
export type DedicationReviewStatus = "approved" | "rejected";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  accessToken?: string;
  template?: string;
  locale?: string;
  termsAcceptedAt?: string;
  termsVersion?: string;
  digitalContentConsentAt?: string;
  digitalContentVersion?: string;
  registryVisibility: RegistryVisibility;
  dedicationReviewStatus: DedicationReviewStatus;
  erasedAt?: string;
}

/** Shape of a row coming from the `members` table. */
interface MemberRow {
  id: string;
  name: string;
  tier: string;
  issue_date: string;
  dedication: string;
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  email: string | null;
  stripe_session_id: string | null;
  access_token: string | null;
  template: string | null;
  locale: string | null;
  terms_accepted_at: string | null;
  terms_version: string | null;
  digital_content_consent_at: string | null;
  digital_content_version: string | null;
  registry_visibility: RegistryVisibility;
  dedication_review_status: DedicationReviewStatus;
  erased_at: string | null;
}

// ---------------------------------------------------------------------------
// Row ↔ Member mapping
// ---------------------------------------------------------------------------

function rowToMember(row: MemberRow): Member {
  // issue_date may be a Date object (timestamptz) or a string — normalise.
  const rawDate = row.issue_date;
  const dateStr =
    typeof rawDate === "string"
      ? rawDate
      : (rawDate as unknown as Date).toISOString();

  return {
    id: row.id,
    name: row.name,
    tier: row.tier,
    date: dateStr,
    dedication: row.dedication,
    referralCode: row.referral_code,
    referredBy: row.referred_by ?? undefined,
    referralCount: row.referral_count,
    email: row.email ?? undefined,
    stripeSessionId: row.stripe_session_id ?? undefined,
    accessToken: row.access_token ?? undefined,
    template: row.template ?? undefined,
    locale: row.locale ?? undefined,
    termsAcceptedAt: row.terms_accepted_at ?? undefined,
    termsVersion: row.terms_version ?? undefined,
    digitalContentConsentAt: row.digital_content_consent_at ?? undefined,
    digitalContentVersion: row.digital_content_version ?? undefined,
    registryVisibility: row.registry_visibility ?? "private",
    dedicationReviewStatus: row.dedication_review_status ?? "approved",
    erasedAt: row.erased_at ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

/** Generate a stable UUID-based member ID. */
export function generateMemberId(): string {
  return `m-${crypto.randomUUID()}`;
}

export function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SHA-${code}`;
}

export function generateAccessToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateArchivedReferralCode(): string {
  return `DEL-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

// ---------------------------------------------------------------------------
// Data-access functions
// ---------------------------------------------------------------------------

/** Return all members (ordered by creation date, newest first). */
export async function listMembers(): Promise<Member[]> {
  const rows = await query<MemberRow>(
    `SELECT * FROM members
      WHERE erased_at IS NULL
      ORDER BY created_at DESC`
  );
  return rows.map(rowToMember);
}

/** Find a single member by primary key. */
export async function getMemberById(id: string): Promise<Member | null> {
  const row = await queryOne<MemberRow>(
    `SELECT * FROM members WHERE id = $1 AND erased_at IS NULL`,
    [id]
  );
  return row ? rowToMember(row) : null;
}

/** Find a member by their access token (certificate URL). */
export async function getMemberByAccessToken(
  token: string
): Promise<Member | null> {
  const row = await queryOne<MemberRow>(
    `SELECT * FROM members WHERE access_token = $1 AND erased_at IS NULL`,
    [token]
  );
  return row ? rowToMember(row) : null;
}

/** Find a member by Stripe checkout session ID. */
export async function getMemberByStripeSession(
  sessionId: string
): Promise<Member | null> {
  const row = await queryOne<MemberRow>(
    `SELECT * FROM members WHERE stripe_session_id = $1`,
    [sessionId]
  );
  return row ? rowToMember(row) : null;
}

/** Find a member by referral code. */
export async function getMemberByReferralCode(
  code: string
): Promise<Member | null> {
  const row = await queryOne<MemberRow>(
    `SELECT * FROM members WHERE referral_code = $1 AND erased_at IS NULL`,
    [code]
  );
  return row ? rowToMember(row) : null;
}

/** Check whether a referral code already exists. */
export async function referralCodeExists(code: string): Promise<boolean> {
  const row = await queryOne<{ n: string }>(
    `SELECT 1 AS n FROM members WHERE referral_code = $1`,
    [code]
  );
  return row !== null;
}

/** Generate a referral code that is unique in the DB. */
export async function generateUniqueReferralCode(): Promise<string> {
  let code: string;
  do {
    code = generateReferralCode();
  } while (await referralCodeExists(code));
  return code;
}

// ---------------------------------------------------------------------------
// createMember — with referral_code collision retry
// ---------------------------------------------------------------------------

const MAX_REFERRAL_RETRIES = 5;

/**
 * Insert a new member.
 *
 * If the insert fails due to a UNIQUE violation on `referral_code`,
 * the function regenerates the code and retries (up to MAX_REFERRAL_RETRIES).
 * Other unique violations (e.g. stripe_session_id) propagate immediately.
 */
export async function createMember(
  member: Omit<Member, "referralCount"> & { referralCount?: number }
): Promise<Member> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_REFERRAL_RETRIES; attempt++) {
    try {
      const row = await queryOne<MemberRow>(
        `INSERT INTO members
           (id, name, tier, issue_date, dedication,
           referral_code, referred_by, referral_count,
           email, stripe_session_id, access_token,
            template, locale, terms_accepted_at, terms_version,
            digital_content_consent_at, digital_content_version,
            registry_visibility, dedication_review_status, erased_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         RETURNING *`,
        [
          member.id,
          member.name,
          member.tier,
          member.date,
          member.dedication || "",
          member.referralCode,
          member.referredBy ?? null,
          member.referralCount ?? 0,
          member.email ?? null,
          member.stripeSessionId ?? null,
          member.accessToken ?? null,
          member.template ?? null,
          member.locale ?? null,
          member.termsAcceptedAt ?? null,
          member.termsVersion ?? null,
          member.digitalContentConsentAt ?? null,
          member.digitalContentVersion ?? null,
          member.registryVisibility,
          member.dedicationReviewStatus,
          member.erasedAt ?? null,
        ]
      );
      return rowToMember(row!);
    } catch (err: unknown) {
      lastError = err;

      // Postgres unique violation = code 23505
      const pgErr = err as { code?: string; constraint?: string };
      if (
        pgErr.code === "23505" &&
        pgErr.constraint?.includes("referral_code")
      ) {
        // Collision on referral_code — regenerate and retry
        member = { ...member, referralCode: generateReferralCode() };
        continue;
      }

      // Any other error (including duplicate stripe_session_id) — propagate
      throw err;
    }
  }

  throw lastError;
}

/** Increment the referral count of a member identified by referral code. */
export async function incrementReferralCount(
  referralCode: string
): Promise<void> {
  await query(
    `UPDATE members
        SET referral_count = referral_count + 1,
            updated_at     = now()
      WHERE referral_code = $1`,
    [referralCode]
  );
}

export async function setMemberRegistryVisibility(
  id: string,
  registryVisibility: RegistryVisibility
): Promise<Member | null> {
  const row = await queryOne<MemberRow>(
    `UPDATE members
        SET registry_visibility = $2,
            updated_at = now()
      WHERE id = $1
      RETURNING *`,
    [id, registryVisibility]
  );

  return row ? rowToMember(row) : null;
}

export async function eraseMemberById(id: string): Promise<Member | null> {
  const row = await queryOne<MemberRow>(
    `UPDATE members
        SET name = 'Deleted Member',
            dedication = '',
            email = NULL,
            access_token = NULL,
            registry_visibility = 'private',
            dedication_review_status = 'approved',
            referral_code = $2,
            erased_at = now(),
            updated_at = now()
      WHERE id = $1
      RETURNING *`,
    [id, generateArchivedReferralCode()]
  );

  return row ? rowToMember(row) : null;
}
