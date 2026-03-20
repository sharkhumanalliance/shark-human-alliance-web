import { Resend } from "resend";

export const EMAIL_FROM =
  process.env.EMAIL_FROM || "Shark Human Alliance <diplomacy@sharkhumanalliance.com>";

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
}): string {
  const { name, tier, registryId, referralCode, downloadUrl, registryUrl, careerUrl } = params;

  const tierLabel: Record<string, string> = {
    basic: "Protected Friend",
    protected: "Protected Friend",
    nonsnack: "Certified Non-Snack",
    business: "Shark-Approved Zone",
  };

  const status = tierLabel[tier] || "Protected Friend";

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
      <h1 style="margin:16px 0 0;color:white;font-size:24px;font-weight:600;">Welcome to the Alliance, ${name}.</h1>
      <p style="margin:8px 0 0;color:#a3c4e0;font-size:14px;">Your diplomatic status has been registered. The sharks have been notified (symbolically).</p>
    </div>

    <!-- Body -->
    <div style="background-color:white;padding:32px 24px;border-left:1px solid #d4e8f7;border-right:1px solid #d4e8f7;">
      <div style="text-align:center;padding:24px;background-color:#f0fdfa;border:2px solid #5eead4;border-radius:16px;">
        <p style="margin:0;font-size:12px;color:#0d9488;text-transform:uppercase;letter-spacing:3px;font-weight:600;">Your Status</p>
        <p style="margin:12px 0 0;font-size:28px;font-weight:700;color:#15324d;">${status}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#5f7892;">Registry ID: ${registryId}</p>
      </div>

      <div style="margin-top:24px;text-align:center;">
        <a href="${downloadUrl}" style="display:inline-block;padding:14px 32px;background-color:#2f80ed;color:white;text-decoration:none;font-weight:600;font-size:16px;border-radius:50px;">Download Your Certificate (PDF)</a>
      </div>

      <div style="margin-top:24px;text-align:center;">
        <a href="${registryUrl}" style="color:#2f80ed;font-weight:600;font-size:14px;text-decoration:none;">View yourself in the Diplomatic Registry &rarr;</a>
      </div>

      <!-- Referral section -->
      <div style="margin-top:32px;padding:24px;background-color:#edf8ff;border-radius:16px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#15324d;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your Alliance Career Starts Now</p>
        <p style="margin:8px 0;font-size:14px;color:#5f7892;">Share your referral link. Every recruit moves you up the ranks.</p>
        <div style="margin:12px auto;padding:12px 20px;background-color:white;border:1px solid #d4e8f7;border-radius:50px;font-family:monospace;font-size:13px;color:#15324d;max-width:360px;word-break:break-all;">
          https://sharkhumanalliance.com/purchase?tier=protected&amp;ref=${referralCode}
        </div>
        <a href="${careerUrl}" style="color:#2f80ed;font-weight:600;font-size:14px;text-decoration:none;">See the full career ladder &rarr;</a>
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
