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

function getRecipientLogMeta(recipient: string | string[] | null | undefined) {
  if (!recipient) {
    return { hasRecipient: false, recipientCount: 0 };
  }

  return {
    hasRecipient: true,
    recipientCount: Array.isArray(recipient) ? recipient.length : 1,
  };
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
      `Your shark paperwork is approved, ${name}`,
    giftCertificateSubject: (name: string) =>
      `${name}'s Shark Human Alliance gift is ready`,
    giftBuyerSubject: (name: string) => `Gift sent: ${name}'s paperwork is ready`,
    certificatePreheader: (name: string, status: string) =>
      `${name}'s ${status} certificate is ready to download.`,
    giftPreheader: (name: string) =>
      `A Shark Human Alliance gift is waiting for ${name}.`,
    giftBuyerPreheader: (name: string) =>
      `Your gift for ${name} has been delivered. You can also send the reveal link yourself.`,
    title: "Your shark paperwork is approved",
    giftHeading: (safeName: string) =>
      `A gift for ${safeName} has arrived.`,
    giftHeadingWithFrom: (safeName: string, safeFromName: string) =>
      `A gift for ${safeName}, arranged by ${safeFromName}.`,
    welcomeHeading: (safeName: string) =>
      `Your shark paperwork is approved, ${safeName}.`,
    giftSubtitle:
      "Open the file, inspect the paperwork, and remain symbolically unbitten.",
    welcomeSubtitle:
      "Your diplomatic status has been registered. The sharks remain symbolically informed and practically indifferent.",
    yourStatus: "Status",
    registryId: "Registry ID",
    downloadCertificate: "Download certificate PDF",
    openGift: "Open your gift",
    secondaryDownload: "Or download the certificate PDF",
    viewRegistry: "View registry record",
    personalMessage: "Personal message",
    careerHeading: "Your turn",
    careerText:
      "Invite another human into the paperwork. Every recruit moves your Alliance record up the ladder.",
    referralButton: "Share referral link",
    careerLink: "See the full career ladder",
    wantedHeading: "Someone else still looks unfiled",
    wantedText:
      "Open a Wanted case for a friend, then let the Bureau recommend the paperwork.",
    wantedLink: "Open a Wanted case",
    orderDetails: "Order details",
    digitalSupply:
      "Your certificate was supplied immediately in digital form at your express request. Once supply began, the withdrawal right ended.",
    manageText:
      "Need to hide your registry record or request erasure? Use the private record controls.",
    manageLink: "Manage record visibility",
    termsLink: "Terms & Purchase Conditions",
    footerTagline: "Shark Human Alliance - Peace between humans and sharks",
    fictionalDisclaimer:
      "This certificate is fictional and does not provide marine protection. A share of every certificate is committed to shark conservation, which is considerably more useful than the paperwork.",
    giftBadge: "Gift",
    giftDelivered: "Gift delivered",
    giftDeliveredBody: (safeName: string, safeRecipientEmail: string) =>
      `Your gift for <strong>${safeName}</strong> has been sent to <strong>${safeRecipientEmail}</strong>.`,
    giftDeliveredFollowup:
      "They receive the certificate email. You can also use the reveal link below if you want to hand over the paperwork yourself.",
    includedMessage: "Included message:",
    giftFrom: (safeFromName: string) => `From ${safeFromName}`,
    fellowHuman: "A fellow human",
    giftShareLink: "Open the gift reveal",
    buyerSoftCta: "Need another human protected?",
    buyerSoftCtaText:
      "Open another file, or get one for yourself before the Bureau notices.",
    buyerPrimaryCta: "Open gift reveal",
    buyerSecondaryCta: "Protect someone else",
    tierLabels: {
      protected: "Protected Friend",
      nonsnack: "Non-Snack Recognition",
      business: "Shark-Free Zone",
    },
  },
  es: {
    certificateSubject: (name: string) =>
      `Tu papeleo tiburón está aprobado, ${name}`,
    giftCertificateSubject: (name: string) =>
      `El regalo Shark Human Alliance de ${name} está listo`,
    giftBuyerSubject: (name: string) =>
      `Regalo enviado: el papeleo de ${name} está listo`,
    certificatePreheader: (name: string, status: string) =>
      `El certificado ${status} de ${name} está listo para descargar.`,
    giftPreheader: (name: string) =>
      `Hay un regalo de Shark Human Alliance esperando a ${name}.`,
    giftBuyerPreheader: (name: string) =>
      `Tu regalo para ${name} ha sido entregado. También puedes enviar tú el enlace de presentación.`,
    title: "Tu papeleo tiburón está aprobado",
    giftHeading: (safeName: string) =>
      `Ha llegado un regalo para ${safeName}.`,
    giftHeadingWithFrom: (safeName: string, safeFromName: string) =>
      `Un regalo para ${safeName}, gestionado por ${safeFromName}.`,
    welcomeHeading: (safeName: string) =>
      `Tu papeleo tiburón está aprobado, ${safeName}.`,
    giftSubtitle:
      "Abre el expediente, revisa el papeleo y permanece simbólicamente sin mordidas.",
    welcomeSubtitle:
      "Tu estatus diplomático ha sido registrado. Los tiburones siguen simbólicamente informados y prácticamente indiferentes.",
    yourStatus: "Estatus",
    registryId: "ID de registro",
    downloadCertificate: "Descargar certificado PDF",
    openGift: "Abrir tu regalo",
    secondaryDownload: "O descargar el certificado PDF",
    viewRegistry: "Ver registro",
    personalMessage: "Mensaje personal",
    careerHeading: "Tu turno",
    careerText:
      "Invita a otro humano al papeleo. Cada recluta hace subir tu registro en la Alianza.",
    referralButton: "Compartir enlace de referido",
    careerLink: "Ver el escalafón completo",
    wantedHeading: "Otra persona sigue sin expediente",
    wantedText:
      "Abre un caso Wanted para un amigo y deja que la Oficina recomiende el papeleo.",
    wantedLink: "Abrir un caso Wanted",
    orderDetails: "Detalles del pedido",
    digitalSupply:
      "Tu certificado fue suministrado inmediatamente en formato digital a petición expresa. Una vez iniciada la entrega, terminó el derecho de desistimiento.",
    manageText:
      "¿Necesitas ocultar tu registro o solicitar la supresión? Usa los controles privados.",
    manageLink: "Gestionar visibilidad del registro",
    termsLink: "Condiciones de compra",
    footerTagline:
      "Shark Human Alliance - Paz entre humanos y tiburones",
    fictionalDisclaimer:
      "Este certificado es ficticio y no proporciona protección marina. Una parte de cada certificado se destina a la conservación de tiburones, lo cual es bastante más útil que el papeleo.",
    giftBadge: "Regalo",
    giftDelivered: "Regalo entregado",
    giftDeliveredBody: (safeName: string, safeRecipientEmail: string) =>
      `Tu regalo para <strong>${safeName}</strong> se ha enviado a <strong>${safeRecipientEmail}</strong>.`,
    giftDeliveredFollowup:
      "Recibirá el email del certificado. También puedes usar el enlace de presentación si quieres entregar el papeleo personalmente.",
    includedMessage: "Mensaje incluido:",
    giftFrom: (safeFromName: string) => `De ${safeFromName}`,
    fellowHuman: "Un humano aliado",
    giftShareLink: "Abrir presentación del regalo",
    buyerSoftCta: "¿Necesitas proteger a otro humano?",
    buyerSoftCtaText:
      "Abre otro expediente, o consigue uno para ti antes de que la Oficina se dé cuenta.",
    buyerPrimaryCta: "Abrir presentación del regalo",
    buyerSecondaryCta: "Proteger a otra persona",
    tierLabels: {
      protected: "Amigo Protegido",
      nonsnack: "Reconocimiento No-Snack",
      business: "Zona Libre de Tiburones",
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
  isGift?: boolean;
  locale?: string | null;
}) {
  const copy = getEmailCopy(params.locale);
  return params.isGift
    ? copy.giftCertificateSubject(params.name)
    : copy.certificateSubject(params.name);
}

export function giftBuyerNotificationSubject(params: {
  name: string;
  locale?: string | null;
}) {
  return getEmailCopy(params.locale).giftBuyerSubject(params.name);
}

export function logEmailRouteEntered(context: EmailLogContext) {
  console.log("[SHA Email] route entered", {
    flow: context.flow,
    route: context.route ?? null,
    hasApiKey: !!process.env.RESEND_API_KEY,
    hasEmailFrom: !!EMAIL_FROM,
    ...getRecipientLogMeta(context.recipient),
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
    hasEmailFrom: !!(payload.from ?? EMAIL_FROM),
    ...getRecipientLogMeta(resolvedContext.recipient ?? payload.to),
    memberId: resolvedContext.memberId ?? null,
    sessionId: resolvedContext.sessionId ?? null,
    tier: resolvedContext.tier ?? null,
    locale: resolvedContext.locale ?? null,
    hasSubject: typeof payload.subject === "string" && payload.subject.length > 0,
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
        resendId:
          data && typeof data === "object" && "id" in data
            ? String(data.id)
            : null,
        errorType:
          error && typeof error === "object" && "name" in error
            ? String(error.name)
            : error
              ? "resend_error"
              : null,
      });

      if (error) {
        throw new Error("[SHA Email] Resend rejected email");
      }

      if (!data?.id) {
        throw new Error("[SHA Email] Resend did not return a message id.");
      }

      return data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[SHA Email] Attempt ${attempt}/${MAX_EMAIL_RETRIES} failed`, {
        flow: resolvedContext.flow,
        ...getRecipientLogMeta(resolvedContext.recipient ?? payload.to),
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

function hiddenPreheader(text: string) {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(text)}</div>`;
}

function primaryButton(label: string, url: string, color = "#f7843b") {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
      <tr>
        <td bgcolor="${color}" style="border-radius:12px;text-align:center;">
          <a href="${url}" style="display:inline-block;min-width:210px;padding:15px 24px;border-radius:12px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

function textLine(label: string, url: string) {
  return `<a href="${url}" style="color:#15324d;font-size:13px;font-weight:700;text-decoration:underline;text-underline-offset:3px;">${label}</a>`;
}

function outlineButton(label: string, url: string) {
  return `<a href="${url}" style="display:inline-block;min-height:20px;padding:10px 15px;border:1px solid #15324d;border-radius:10px;background-color:#ffffff;color:#15324d;font-size:13px;font-weight:700;text-decoration:none;">${label}</a>`;
}

function certificateEmailPreheader(params: {
  name: string;
  tier: string;
  isGift?: boolean;
  locale?: string | null;
}) {
  const copy = getEmailCopy(params.locale);
  return params.isGift
    ? copy.giftPreheader(params.name)
    : copy.certificatePreheader(
        params.name,
        getEmailTierLabel(params.tier, params.locale),
      );
}

function giftBuyerNotificationPreheader(params: {
  name: string;
  locale?: string | null;
}) {
  return getEmailCopy(params.locale).giftBuyerPreheader(params.name);
}

type CertificateEmailTemplateParams = {
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
  fromName?: string;
  revealUrl?: string;
  isGift?: boolean;
  locale?: string | null;
};

type GiftBuyerNotificationEmailParams = {
  name: string;
  recipientEmail: string;
  giftMessage?: string;
  revealUrl?: string;
  purchaseUrl?: string;
  locale?: string | null;
};

/**
 * Generate the HTML email template for a certificate delivery.
 */
export function certificateEmailHtml(
  params: CertificateEmailTemplateParams
): string {
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
    fromName,
    revealUrl,
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
  const preheader = certificateEmailPreheader({
    name,
    tier,
    isGift,
    locale: resolvedLocale,
  });
  const safeWantedUrl = escapeHtml(
    buildAbsoluteLocalizedUrl(
      process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com",
      resolvedLocale,
      "/wanted"
    )
  );
  const safeReferralUrl = escapeHtml(
    referralUrl ||
      buildAbsoluteLocalizedUrl(
        process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com",
        resolvedLocale,
        buildReferralHref(referralCode)
      )
  );
  const hasGiftMessage = isGift && !!giftMessage?.trim();
  const safeGiftMessage = hasGiftMessage
    ? escapeHtmlWithLineBreaks(giftMessage ?? "")
    : "";
  const safeFromName = escapeHtml(fromName?.trim() || copy.fellowHuman);
  const safeRevealUrl = revealUrl ? escapeHtml(revealUrl) : "";
  const safeRegistryUrl = registryUrl ? escapeHtml(registryUrl) : "";
  const heading =
    isGift
      ? copy.giftHeadingWithFrom(safeName, safeFromName)
      : copy.welcomeHeading(safeName);
  const primaryAction =
    isGift && safeRevealUrl
      ? primaryButton(copy.openGift, safeRevealUrl)
      : primaryButton(copy.downloadCertificate, safeDownloadUrl);
  const secondaryAction =
    isGift && safeRevealUrl
      ? textLine(copy.secondaryDownload, safeDownloadUrl)
      : safeRegistryUrl
        ? textLine(copy.viewRegistry, safeRegistryUrl)
        : "";

  return `<!DOCTYPE html>
<html lang="${resolvedLocale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${copy.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5fbff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  ${hiddenPreheader(preheader)}
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;padding:32px 24px;background-color:#15324d;border-radius:24px 24px 0 0;">
      <div style="display:inline-block;width:56px;height:56px;line-height:56px;background-color:#2f80ed;border-radius:16px;color:white;font-weight:bold;font-size:18px;">SHA</div>
      <h1 style="margin:16px 0 0;color:white;font-size:24px;line-height:1.25;font-weight:700;">${heading}</h1>
      <p style="margin:8px 0 0;color:#a3c4e0;font-size:14px;">${isGift ? copy.giftSubtitle : copy.welcomeSubtitle}</p>
    </div>

    <div style="background-color:white;padding:32px 24px;border-left:1px solid #d4e8f7;border-right:1px solid #d4e8f7;">
      <div style="text-align:center;">
        ${primaryAction}
        ${secondaryAction ? `<p style="margin:14px 0 0;">${secondaryAction}</p>` : ""}
      </div>

      <div style="margin-top:28px;padding:16px;background-color:#f8fafc;border:1px solid #dbe4ee;border-radius:14px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding:4px 0;color:#5f7892;font-size:12px;text-transform:uppercase;letter-spacing:1.8px;font-weight:700;">${copy.yourStatus}</td>
            <td align="right" style="padding:4px 0;color:#15324d;font-size:13px;font-weight:700;">${safeStatus}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#5f7892;font-size:12px;text-transform:uppercase;letter-spacing:1.8px;font-weight:700;">${copy.registryId}</td>
            <td align="right" style="padding:4px 0;color:#15324d;font-size:13px;font-weight:700;">${safeRegistryId}</td>
          </tr>
        </table>
      </div>

      ${hasGiftMessage ? `
      <div style="margin-top:24px;padding:20px;background-color:#fff7ed;border:1px solid #fed7aa;border-radius:14px;">
        <p style="margin:0 0 8px;font-size:12px;color:#9a3412;text-transform:uppercase;letter-spacing:2px;font-weight:700;">${copy.personalMessage}</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#7c2d12;">${safeGiftMessage}</p>
        <p style="margin:12px 0 0;font-size:14px;font-weight:700;color:#7c2d12;">- ${copy.giftFrom(safeFromName)}</p>
      </div>` : ""}

      <div style="margin-top:28px;padding:22px;background-color:#f8fafc;border:1px solid #dbe4ee;border-radius:14px;">
        <p style="margin:0;font-size:12px;color:#15324d;text-transform:uppercase;letter-spacing:2px;font-weight:700;">${copy.careerHeading}</p>
        <p style="margin:8px 0 16px;font-size:14px;line-height:1.6;color:#5f7892;">${copy.careerText}</p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding:0 0 12px;">
              ${outlineButton(copy.referralButton, safeReferralUrl)}
            </td>
          </tr>
          <tr>
            <td style="padding:0;">
              ${textLine(copy.careerLink, safeCareerUrl)}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 0 0;border-top:1px solid #dbe4ee;">
              <p style="margin:0 0 6px;font-size:12px;color:#15324d;text-transform:uppercase;letter-spacing:2px;font-weight:700;">${copy.wantedHeading}</p>
              <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#5f7892;">${copy.wantedText}</p>
              ${textLine(copy.wantedLink, safeWantedUrl)}
            </td>
          </tr>
        </table>
      </div>

      <div style="margin-top:24px;padding-top:18px;border-top:1px solid #dbe4ee;">
        ${!isGift ? `<p style="margin:0 0 12px;font-size:12px;line-height:1.7;color:#5f7892;">${copy.digitalSupply}</p>` : ""}
        <p style="margin:0 0 10px;font-size:12px;line-height:1.7;color:#5f7892;">${copy.manageText}</p>
        <p style="margin:0;font-size:12px;line-height:1.8;">
          ${textLine(copy.manageLink, safeManageUrl)}
          ${!isGift ? `&nbsp;&nbsp; ${textLine(copy.termsLink, safeTermsUrl)}` : ""}
        </p>
      </div>
    </div>

    <div style="padding:24px;background-color:#15324d;border-radius:0 0 24px 24px;text-align:center;">
      <p style="margin:0;color:#a3c4e0;font-size:12px;">${copy.footerTagline}</p>
      <p style="margin:8px 0 0;color:#5f7892;font-size:11px;">${copy.fictionalDisclaimer}</p>
      <p style="margin:12px 0 0;color:#5f7892;font-size:11px;">&copy; 2026 Shark Human Alliance</p>
    </div>
  </div>
</body>
</html>`;
}

export function certificateEmailText(
  params: CertificateEmailTemplateParams
): string {
  const resolvedLocale = getCertificateLocale(params.locale ?? undefined);
  const copy = getEmailCopy(resolvedLocale);
  const status = getEmailTierLabel(params.tier, resolvedLocale);
  const from = params.fromName?.trim() || copy.fellowHuman;
  const referralUrl =
    params.referralUrl ||
    buildAbsoluteLocalizedUrl(
      process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com",
      resolvedLocale,
      buildReferralHref(params.referralCode)
    );
  const wantedUrl = buildAbsoluteLocalizedUrl(
    process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com",
    resolvedLocale,
    "/wanted"
  );
  const lines = [
    params.isGift
      ? copy.giftHeadingWithFrom(params.name, from)
      : copy.welcomeHeading(params.name),
    "",
    `${copy.yourStatus}: ${status}`,
    `${copy.registryId}: ${params.registryId}`,
    "",
  ];

  if (params.isGift && params.revealUrl) {
    lines.push(`${copy.openGift}: ${params.revealUrl}`);
    lines.push(`${copy.secondaryDownload}: ${params.downloadUrl}`);
  } else {
    lines.push(`${copy.downloadCertificate}: ${params.downloadUrl}`);
    if (params.registryUrl) {
      lines.push(`${copy.viewRegistry}: ${params.registryUrl}`);
    }
  }

  if (params.isGift && params.giftMessage?.trim()) {
    lines.push("", `${copy.personalMessage}:`, params.giftMessage.trim(), `- ${copy.giftFrom(from)}`);
  }

  lines.push(
    "",
    copy.careerHeading,
    copy.careerText,
    `${copy.referralButton}: ${referralUrl}`,
    `${copy.careerLink}: ${params.careerUrl}`,
    "",
    copy.wantedHeading,
    copy.wantedText,
    `${copy.wantedLink}: ${wantedUrl}`,
    "",
    copy.manageText,
    `${copy.manageLink}: ${params.manageUrl}`
  );

  if (!params.isGift) {
    lines.push(copy.digitalSupply, `${copy.termsLink}: ${params.termsUrl}`);
  }

  lines.push("", copy.fictionalDisclaimer);
  return lines.join("\n");
}

export function giftBuyerNotificationEmailHtml(
  params: GiftBuyerNotificationEmailParams
): string {
  const {
    name,
    recipientEmail,
    giftMessage,
    revealUrl,
    purchaseUrl,
    locale,
  } = params;
  const resolvedLocale = getCertificateLocale(locale ?? undefined);
  const copy = getEmailCopy(resolvedLocale);
  const safeName = escapeHtml(name);
  const safeRecipientEmail = escapeHtml(recipientEmail);
  const safeGiftMessage = giftMessage
    ? escapeHtmlWithLineBreaks(giftMessage)
    : "";
  const safeRevealUrl = revealUrl ? escapeHtml(revealUrl) : "";
  const safePurchaseUrl = escapeHtml(
    purchaseUrl ||
      buildAbsoluteLocalizedUrl(
        process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com",
        resolvedLocale,
        "/purchase?tier=protected&gift=true"
      )
  );

  return `<!DOCTYPE html>
<html lang="${resolvedLocale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${copy.giftDelivered}</title>
</head>
<body style="margin:0;padding:0;background:#f5fbff;font-family:'Helvetica Neue',Arial,sans-serif;">
${hiddenPreheader(giftBuyerNotificationPreheader({ name, locale: resolvedLocale }))}
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background:white;border-radius:24px;padding:32px;text-align:center;border:1px solid #d4e8f7;">
    <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#64748b;">${copy.giftBadge}</div>
    <h1 style="color:#15324d;font-size:24px;margin:16px 0 8px;">${copy.giftDelivered}</h1>
    <p style="color:#5f7892;font-size:14px;line-height:1.6;">
      ${copy.giftDeliveredBody(safeName, safeRecipientEmail)}
      ${safeGiftMessage ? `<br><br><em>${copy.includedMessage}</em> ${safeGiftMessage}` : ""}
    </p>
    <p style="color:#5f7892;font-size:13px;line-height:1.6;margin:16px 0 24px;">${copy.giftDeliveredFollowup}</p>
    ${safeRevealUrl ? primaryButton(copy.buyerPrimaryCta, safeRevealUrl) : primaryButton(copy.buyerSecondaryCta, safePurchaseUrl)}
    <div style="margin-top:24px;padding:18px;background:#f8fafc;border:1px solid #dbe4ee;border-radius:14px;text-align:left;">
      <p style="margin:0 0 8px;color:#15324d;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;font-weight:700;">${copy.buyerSoftCta}</p>
      <p style="margin:0 0 12px;color:#5f7892;font-size:14px;line-height:1.6;">${copy.buyerSoftCtaText}</p>
      ${textLine(copy.buyerSecondaryCta, safePurchaseUrl)}
    </div>
  </div>
  <p style="text-align:center;color:#5f7892;font-size:11px;margin-top:16px;">&copy; 2026 Shark Human Alliance</p>
</div>
</body></html>`;
}

export function giftBuyerNotificationEmailText(
  params: GiftBuyerNotificationEmailParams
): string {
  const resolvedLocale = getCertificateLocale(params.locale ?? undefined);
  const copy = getEmailCopy(resolvedLocale);
  const purchaseUrl =
    params.purchaseUrl ||
    buildAbsoluteLocalizedUrl(
      process.env.NEXT_PUBLIC_BASE_URL || "https://sharkhumanalliance.com",
      resolvedLocale,
      "/purchase?tier=protected&gift=true"
    );
  const lines = [
    copy.giftDelivered,
    "",
    `${params.name} -> ${params.recipientEmail}`,
    copy.giftDeliveredFollowup,
  ];

  if (params.giftMessage?.trim()) {
    lines.push("", `${copy.includedMessage} ${params.giftMessage.trim()}`);
  }

  if (params.revealUrl) {
    lines.push("", `${copy.buyerPrimaryCta}: ${params.revealUrl}`);
  }

  lines.push("", copy.buyerSoftCta, copy.buyerSoftCtaText, `${copy.buyerSecondaryCta}: ${purchaseUrl}`);
  return lines.join("\n");
}
