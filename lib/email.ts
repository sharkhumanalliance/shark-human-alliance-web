import { buildAbsoluteLocalizedUrl, buildReferralHref } from "@/lib/navigation";
import {
  getCertificateLocale,
  getCertificateTierKey,
} from "@/lib/certificate-display-copy";
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

const EMAIL_COPY = {
  en: {
    certificateSubject: (name: string) =>
      `Your Alliance Certificate - Welcome, ${name}!`,
    giftBuyerSubject: (name: string, status: string) =>
      `Gift sent! ${name} is now a ${status}`,
    title: "Your Alliance Certificate",
    giftHeading: (safeName: string) =>
      `A certificate has arrived for ${safeName}.`,
    welcomeHeading: (safeName: string) => `Welcome to the Alliance, ${safeName}.`,
    giftSubtitle: "A fellow diplomat has arranged your paperwork.",
    welcomeSubtitle:
      "Your diplomatic status has been registered. The sharks have been notified (symbolically).",
    yourStatus: "Your Status",
    registryId: "Registry ID",
    downloadCertificate: "Download Your Certificate (PDF)",
    viewRegistry: "View yourself in the Diplomatic Registry &rarr;",
    personalMessage: "Personal message",
    careerHeading: "Your Alliance Career Starts Now",
    careerText: "Share your referral link. Every recruit moves you up the ranks.",
    careerLink: "See the full career ladder &rarr;",
    orderDetails: "Order details",
    digitalSupply:
      "Your certificate was supplied immediately in digital form at your express request. Once supply began, the withdrawal right ended.",
    manageText:
      "Need to hide your registry record or request erasure? Use the private record controls linked below.",
    manageLink: "Manage record visibility &rarr;",
    termsLink: "Terms &amp; Purchase Conditions &rarr;",
    footerTagline: "Shark Human Alliance &mdash; Peace between humans and sharks",
    fictionalDisclaimer:
      "This certificate is 100% fictional and guarantees absolutely no marine protection.<br>The conservation donations, however, are very real.",
    giftBadge: "Gift",
    giftDelivered: "Gift Delivered!",
    giftDeliveredBody: (safeName: string, safeRecipientEmail: string) =>
      `Your gift for <strong>${safeName}</strong> has been sent to <strong>${safeRecipientEmail}</strong>.<br>They'll receive their certificate and a warm welcome from the Alliance.`,
    includedMessage: "Included message:",
    referralCode: "Your referral code:",
    referralText: "Share it with friends to climb the Alliance career ladder!",
    viewCareer: "View Career Ladder",
    tierLabels: {
      protected: "Protected Friend",
      nonsnack: "Certified Non-Snack",
      business: "Shark-Approved Zone",
    },
  },
  es: {
    certificateSubject: (name: string) =>
      `Tu certificado de la Alianza - Bienvenido/a, ${name}!`,
    giftBuyerSubject: (name: string, status: string) =>
      `¡Regalo enviado! ${name} ahora tiene ${status}`,
    title: "Tu certificado de la Alianza",
    giftHeading: (safeName: string) =>
      `Ha llegado un certificado para ${safeName}.`,
    welcomeHeading: (safeName: string) => `Bienvenido/a a la Alianza, ${safeName}.`,
    giftSubtitle: "Un/a diplomático/a ha gestionado tu papeleo.",
    welcomeSubtitle:
      "Tu estatus diplomático ha sido registrado. Los tiburones han sido notificados (simbólicamente).",
    yourStatus: "Tu estatus",
    registryId: "ID de registro",
    downloadCertificate: "Descargar certificado (PDF)",
    viewRegistry: "Verte en el Registro Diplomático &rarr;",
    personalMessage: "Mensaje personal",
    careerHeading: "Tu carrera en la Alianza comienza ahora",
    careerText: "Comparte tu enlace de referido. Cada recluta te sube de rango.",
    careerLink: "Ver el escalafón completo &rarr;",
    orderDetails: "Detalles del pedido",
    digitalSupply:
      "Tu certificado fue suministrado inmediatamente en formato digital a petición expresa. Una vez iniciada la entrega, terminó el derecho de desistimiento.",
    manageText:
      "¿Necesitas ocultar tu registro o solicitar la supresión? Usa los controles privados enlazados abajo.",
    manageLink: "Gestionar visibilidad del registro &rarr;",
    termsLink: "Condiciones de compra &rarr;",
    footerTagline:
      "Shark Human Alliance &mdash; Paz entre humanos y tiburones",
    fictionalDisclaimer:
      "Este certificado es 100 % ficticio y no garantiza ninguna protección marina.<br>La financiación para conservación, sin embargo, es muy real.",
    giftBadge: "Regalo",
    giftDelivered: "¡Regalo entregado!",
    giftDeliveredBody: (safeName: string, safeRecipientEmail: string) =>
      `Tu regalo para <strong>${safeName}</strong> se ha enviado a <strong>${safeRecipientEmail}</strong>.<br>Recibirá su certificado y una bienvenida formal de la Alianza.`,
    includedMessage: "Mensaje incluido:",
    referralCode: "Tu código de referido:",
    referralText: "Compártelo con amigos para subir en el escalafón de la Alianza.",
    viewCareer: "Ver escalafón",
    tierLabels: {
      protected: "Amigo Protegido",
      nonsnack: "No-Snack Certificado",
      business: "Zona Aprobada por Tiburones",
    },
  },
} as const;

function getEmailCopy(locale?: string | null) {
  return EMAIL_COPY[getCertificateLocale(locale ?? undefined)];
}

function getEmailTierLabel(tier: string, locale?: string | null) {
  const copy = getEmailCopy(locale);
  return copy.tierLabels[getCertificateTierKey(tier)];
}

export function certificateEmailSubject(params: {
  name: string;
  locale?: string | null;
}) {
  return getEmailCopy(params.locale).certificateSubject(params.name);
}

export function giftBuyerNotificationSubject(params: {
  name: string;
  tier: string;
  locale?: string | null;
}) {
  const status = getEmailTierLabel(params.tier, params.locale);
  return getEmailCopy(params.locale).giftBuyerSubject(params.name, status);
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
  registryUrl?: string;
  careerUrl: string;
  termsUrl: string;
  manageUrl: string;
  referralUrl?: string;
  giftMessage?: string;
  isGift?: boolean;
  locale?: string | null;
}): string {
  const {
    name,
    tier,
    registryId,
    referralCode,
    downloadUrl,
    registryUrl,
    careerUrl,
    termsUrl,
    manageUrl,
    referralUrl,
    giftMessage,
    isGift,
    locale,
  } = params;

  const resolvedLocale = getCertificateLocale(locale ?? undefined);
  const copy = getEmailCopy(resolvedLocale);
  const status = getEmailTierLabel(tier, resolvedLocale);
  const safeName = escapeHtml(name);
  const safeStatus = escapeHtml(status);
  const safeRegistryId = escapeHtml(registryId);
  const safeDownloadUrl = escapeHtml(downloadUrl);
  const safeCareerUrl = escapeHtml(careerUrl);
  const safeTermsUrl = escapeHtml(termsUrl);
  const safeManageUrl = escapeHtml(manageUrl);
  const safeReferralUrl = escapeHtml(
    referralUrl ||
      buildAbsoluteLocalizedUrl(
        process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com",
        resolvedLocale,
        buildReferralHref(referralCode)
      )
  );
  const safeGiftMessage = giftMessage
    ? escapeHtmlWithLineBreaks(giftMessage)
    : "";
  const safeRegistryUrl = registryUrl ? escapeHtml(registryUrl) : "";

  return `<!DOCTYPE html>
<html lang="${resolvedLocale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${copy.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5fbff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;padding:32px 24px;background-color:#15324d;border-radius:24px 24px 0 0;">
      <div style="display:inline-block;width:56px;height:56px;line-height:56px;background-color:#2f80ed;border-radius:16px;color:white;font-weight:bold;font-size:18px;">SHA</div>
      <h1 style="margin:16px 0 0;color:white;font-size:24px;font-weight:600;">${isGift ? copy.giftHeading(safeName) : copy.welcomeHeading(safeName)}</h1>
      <p style="margin:8px 0 0;color:#a3c4e0;font-size:14px;">${isGift ? copy.giftSubtitle : copy.welcomeSubtitle}</p>
    </div>

    <!-- Body -->
    <div style="background-color:white;padding:32px 24px;border-left:1px solid #d4e8f7;border-right:1px solid #d4e8f7;">
      <div style="text-align:center;padding:24px;background-color:#f0fdfa;border:2px solid #5eead4;border-radius:16px;">
        <p style="margin:0;font-size:12px;color:#0d9488;text-transform:uppercase;letter-spacing:3px;font-weight:600;">${copy.yourStatus}</p>
        <p style="margin:12px 0 0;font-size:28px;font-weight:700;color:#15324d;">${safeStatus}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#5f7892;">${copy.registryId}: ${safeRegistryId}</p>
      </div>

      <div style="margin-top:24px;text-align:center;">
        <a href="${safeDownloadUrl}" style="display:inline-block;padding:14px 32px;background-color:#2f80ed;color:white;text-decoration:none;font-weight:600;font-size:16px;border-radius:50px;">${copy.downloadCertificate}</a>
      </div>

      ${registryUrl ? `
      <div style="margin-top:24px;text-align:center;">
        <a href="${safeRegistryUrl}" style="color:#2f80ed;font-weight:600;font-size:14px;text-decoration:none;">${copy.viewRegistry}</a>
      </div>` : ""}

      ${giftMessage ? `
      <div style="margin-top:24px;padding:20px;background-color:#fff7ed;border:1px solid #fed7aa;border-radius:16px;">
        <p style="margin:0 0 8px;font-size:12px;color:#9a3412;text-transform:uppercase;letter-spacing:2px;font-weight:700;">${copy.personalMessage}</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#7c2d12;">${safeGiftMessage}</p>
      </div>` : ""}

      <!-- Referral section -->
      <div style="margin-top:32px;padding:24px;background-color:#edf8ff;border-radius:16px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#15324d;text-transform:uppercase;letter-spacing:2px;font-weight:600;">${copy.careerHeading}</p>
        <p style="margin:8px 0;font-size:14px;color:#5f7892;">${copy.careerText}</p>
        <div style="margin:12px auto;padding:12px 20px;background-color:white;border:1px solid #d4e8f7;border-radius:50px;font-family:monospace;font-size:13px;color:#15324d;max-width:360px;word-break:break-all;">
          ${safeReferralUrl}
        </div>
        <a href="${safeCareerUrl}" style="color:#2f80ed;font-weight:600;font-size:14px;text-decoration:none;">${copy.careerLink}</a>
      </div>

      <div style="margin-top:24px;padding:20px;background-color:#f8fafc;border:1px solid #dbe4ee;border-radius:16px;">
        <p style="margin:0 0 8px;font-size:12px;color:#15324d;text-transform:uppercase;letter-spacing:2px;font-weight:700;">${copy.orderDetails}</p>
        <p style="margin:0;font-size:13px;line-height:1.7;color:#5f7892;">
          ${copy.digitalSupply}
        </p>
        <p style="margin:12px 0 0;font-size:13px;line-height:1.7;color:#5f7892;">
          ${copy.manageText}
        </p>
        <p style="margin:12px 0 0;">
          <a href="${safeManageUrl}" style="color:#2f80ed;font-weight:600;font-size:14px;text-decoration:none;">${copy.manageLink}</a>
        </p>
        <p style="margin:10px 0 0;">
          <a href="${safeTermsUrl}" style="color:#2f80ed;font-weight:600;font-size:14px;text-decoration:none;">${copy.termsLink}</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:24px;background-color:#15324d;border-radius:0 0 24px 24px;text-align:center;">
      <p style="margin:0;color:#a3c4e0;font-size:12px;">${copy.footerTagline}</p>
      <p style="margin:8px 0 0;color:#5f7892;font-size:11px;">${copy.fictionalDisclaimer}</p>
      <p style="margin:12px 0 0;color:#5f7892;font-size:11px;">&copy; 2026 Shark Human Alliance</p>
    </div>
  </div>
</body>
</html>`;
}

export function giftBuyerNotificationEmailHtml(params: {
  name: string;
  recipientEmail: string;
  referralCode: string;
  careerUrl: string;
  giftMessage?: string;
  locale?: string | null;
}): string {
  const {
    name,
    recipientEmail,
    referralCode,
    careerUrl,
    giftMessage,
    locale,
  } = params;
  const resolvedLocale = getCertificateLocale(locale ?? undefined);
  const copy = getEmailCopy(resolvedLocale);
  const safeName = escapeHtml(name);
  const safeRecipientEmail = escapeHtml(recipientEmail);
  const safeReferralCode = escapeHtml(referralCode);
  const safeGiftMessage = giftMessage
    ? escapeHtmlWithLineBreaks(giftMessage)
    : "";
  const safeCareerUrl = escapeHtml(careerUrl);

  return `<!DOCTYPE html>
<html lang="${resolvedLocale}"><body style="margin:0;padding:0;background:#f5fbff;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background:white;border-radius:24px;padding:32px;text-align:center;border:1px solid #d4e8f7;">
    <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#64748b;">${copy.giftBadge}</div>
    <h1 style="color:#15324d;font-size:24px;margin:16px 0 8px;">${copy.giftDelivered}</h1>
    <p style="color:#5f7892;font-size:14px;line-height:1.6;">
      ${copy.giftDeliveredBody(safeName, safeRecipientEmail)}
      ${safeGiftMessage ? `<br><br><em>${copy.includedMessage}</em> ${safeGiftMessage}` : ""}
    </p>
    <p style="color:#5f7892;font-size:13px;margin-top:16px;">
      ${copy.referralCode} <strong>${safeReferralCode}</strong><br>
      ${copy.referralText}
    </p>
    <a href="${safeCareerUrl}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#2f80ed;color:white;text-decoration:none;border-radius:50px;font-weight:600;">${copy.viewCareer}</a>
  </div>
  <p style="text-align:center;color:#5f7892;font-size:11px;margin-top:16px;">&copy; 2026 Shark Human Alliance</p>
</div>
</body></html>`;
}
