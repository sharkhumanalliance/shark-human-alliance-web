import { buildAbsoluteLocalizedUrl, buildReferralHref } from "@/lib/navigation";
import { Resend } from "resend";

export const EMAIL_FROM =
  process.env.EMAIL_FROM || "Shark Human Alliance <hello@updates.sharkhumanalliance.com>";

type EmailLogContext = {
  flow: string;
  route?: string;
  recipient?: string | string[] | null;
  memberId?: string | null;
  sessionId?: string | null;
  tier?: string | null;
  locale?: string | null;
};

/**
 * Returns a Resend client instance.
 * Lazy-initialized to avoid crashing at build time when the API key
 * is not available (Vercel only injects runtime env vars, not build-time).
 */
let _resend: Resend | null = null;

export function getResend(): Resend {
  if (_resend) return _resend;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("[SHA] RESEND_API_KEY is not set. Cannot initialize Resend.");
  }

  _resend = new Resend(key);
  return _resend;
}

function normalizeRecipient(recipient: string | string[] | null | undefined) {
  if (!recipient) return null;
  return Array.isArray(recipient) ? recipient.join(", ") : recipient;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlWithLineBreaks(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

export function logEmailRouteEntered(context: EmailLogContext) {
  console.log("[SHA Email] route entered", {
    flow: context.flow,
    route: context.route ?? null,
    hasApiKey: !!process.env.RESEND_API_KEY,
    emailFrom: EMAIL_FROM,
    recipient: normalizeRecipient(context.recipient),
    memberId: context.memberId ?? null,
    sessionId: context.sessionId ?? null,
    tier: context.tier ?? null,
    locale: context.locale ?? null,
  });
}

const MAX_EMAIL_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendEmailStrict(
  payload: Parameters<Resend["emails"]["send"]>[0],
  context?: EmailLogContext
) {
  const resolvedContext = context ?? { flow: "unknown" };

  console.log("[SHA Email] resend send start", {
    flow: resolvedContext.flow,
    route: resolvedContext.route ?? null,
    hasApiKey: !!process.env.RESEND_API_KEY,
    emailFrom: payload.from ?? EMAIL_FROM,
    recipient: normalizeRecipient(resolvedContext.recipient) ?? normalizeRecipient(payload.to),
    memberId: resolvedContext.memberId ?? null,
    sessionId: resolvedContext.sessionId ?? null,
    tier: resolvedContext.tier ?? null,
    locale: resolvedContext.locale ?? null,
    subject: payload.subject ?? null,
  });

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_EMAIL_RETRIES; attempt++) {
    try {
      const { data, error } = await getResend().emails.send(payload);

      console.log("[SHA Email] resend result", {
        flow: resolvedContext.flow,
        route: resolvedContext.route ?? null,
        attempt,
        hasData: !!data,
        hasError: !!error,
        data: data ?? null,
        error: error ?? null,
      });

      if (error) {
        const details =
          typeof error === "object" ? JSON.stringify(error) : String(error);
        throw new Error(`[SHA Email] Resend rejected email: ${details}`);
      }

      if (!data?.id) {
        throw new Error("[SHA Email] Resend did not return a message id.");
      }

      return data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[SHA Email] Attempt ${attempt}/${MAX_EMAIL_RETRIES} failed`, {
        flow: resolvedContext.flow,
        recipient: normalizeRecipient(resolvedContext.recipient) ?? normalizeRecipient(payload.to),
        memberId: resolvedContext.memberId ?? null,
        error: lastError.message,
      });

      if (attempt < MAX_EMAIL_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError!;
}

/**
 * Generate the HTML email template for a certificate delivery.
 */
export function certificateEmailHtml(params: {
  name: string;
  tier: string;
  registryId: string;
  referralCode: string;
  downloadUrl: string;
  registryUrl: string;
  careerUrl: string;
  referralUrl?: string;
  giftMessage?: string;
  isGift?: boolean;
}): string {
  const { name, tier, registryId, referralCode, downloadUrl, registryUrl, careerUrl, referralUrl, giftMessage, isGift } = params;

  const tierLabel: Record<string, string> = {
    basic: "Protected Friend",
    protected: "Protected Friend",
    nonsnack: "Certified Non-Snack",
    business: "Shark-Approved Zone",
  };

  const status = tierLabel[tier] || "Protected Friend";
  const safeName = escapeHtml(name);
  const safeStatus = escapeHtml(status);
  const safeRegistryId = escapeHtml(registryId);
  const safeDownloadUrl = escapeHtml(downloadUrl);
  const safeRegistryUrl = escapeHtml(registryUrl);
  const safeCareerUrl = escapeHtml(careerUrl);
  const safeReferralUrl = escapeHtml(
    referralUrl ||
      buildAbsoluteLocalizedUrl(
        process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com",
        "en",
        buildReferralHref(referralCode)
      )
  );
  const safeGiftMessage = giftMessage
    ? escapeHtmlWithLineBreaks(giftMessage)
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your Alliance Certificate</title>
</head>
<body style="margin:0;padding:0;background-color:#f5fbff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;padding:32px 24px;background-color:#15324d;border-radius:24px 24px 0 0;">
      <div style="display:inline-block;width:56px;height:56px;line-height:56px;background-color:#2f80ed;border-radius:16px;color:white;font-weight:bold;font-size:18px;">SHA</div>
      <h1 style="margin:16px 0 0;color:white;font-size:24px;font-weight:600;">${isGift ? `A certificate has arrived for ${safeName}.` : `Welcome to the Alliance, ${safeName}.`}</h1>
      <p style="margin:8px 0 0;color:#a3c4e0;font-size:14px;">${isGift ? `A fellow diplomat has arranged your paperwork.` : `Your diplomatic status has been registered. The sharks have been notified (symbolically).`}</p>
    </div>

    <!-- Body -->
    <div style="background-color:white;padding:32px 24px;border-left:1px solid #d4e8f7;border-right:1px solid #d4e8f7;">
      <div style="text-align:center;padding:24px;background-color:#f0fdfa;border:2px solid #5eead4;border-radius:16px;">
        <p style="margin:0;font-size:12px;color:#0d9488;text-transform:uppercase;letter-spacing:3px;font-weight:600;">Your Status</p>
        <p style="margin:12px 0 0;font-size:28px;font-weight:700;color:#15324d;">${safeStatus}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#5f7892;">Registry ID: ${safeRegistryId}</p>
      </div>

      <div style="margin-top:24px;text-align:center;">
        <a href="${safeDownloadUrl}" style="display:inline-block;padding:14px 32px;background-color:#2f80ed;color:white;text-decoration:none;font-weight:600;font-size:16px;border-radius:50px;">Download Your Certificate (PDF)</a>
      </div>

      <div style="margin-top:24px;text-align:center;">
        <a href="${safeRegistryUrl}" style="color:#2f80ed;font-weight:600;font-size:14px;text-decoration:none;">View yourself in the Diplomatic Registry &rarr;</a>
      </div>

      ${giftMessage ? `
      <div style="margin-top:24px;padding:20px;background-color:#fff7ed;border:1px solid #fed7aa;border-radius:16px;">
        <p style="margin:0 0 8px;font-size:12px;color:#9a3412;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Personal message</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#7c2d12;">${safeGiftMessage}</p>
      </div>` : ""}

      <!-- Referral section -->
      <div style="margin-top:32px;padding:24px;background-color:#edf8ff;border-radius:16px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#15324d;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your Alliance Career Starts Now</p>
        <p style="margin:8px 0;font-size:14px;color:#5f7892;">Share your referral link. Every recruit moves you up the ranks.</p>
        <div style="margin:12px auto;padding:12px 20px;background-color:white;border:1px solid #d4e8f7;border-radius:50px;font-family:monospace;font-size:13px;color:#15324d;max-width:360px;word-break:break-all;">
          ${safeReferralUrl}
        </div>
        <a href="${safeCareerUrl}" style="color:#2f80ed;font-weight:600;font-size:14px;text-decoration:none;">See the full career ladder &rarr;</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:24px;background-color:#15324d;border-radius:0 0 24px 24px;text-align:center;">
      <p style="margin:0;color:#a3c4e0;font-size:12px;">Shark Human Alliance &mdash; Peace between humans and sharks</p>
      <p style="margin:8px 0 0;color:#5f7892;font-size:11px;">This certificate is 100% fictional and guarantees absolutely no marine protection.<br>The conservation donations, however, are very real.</p>
      <p style="margin:12px 0 0;color:#5f7892;font-size:11px;">&copy; 2026 Shark Human Alliance</p>
    </div>
  </div>
</body>
</html>`;
}
