import {
  getCertificateDiplomaticNote,
  getCertificateFooterAside,
  getCertificateHumorSeed,
} from "@/lib/certificate-humor";
import {
  getCertificateDisplayCopy,
  getCertificateTierKey,
} from "@/lib/certificate-display-copy";
import {
  normalizeTemplate,
  type CertificateTemplate,
} from "@/lib/certificate-templates";
import { getQrCodeUrl, getVerificationUrl } from "@/lib/qr-svg";
import type { PaperFormat } from "./certificate-sheet";

/** Legacy template IDs — kept here so values stored before the rename
 *  ("hero" → "playful", "formal" → "classic") still resolve to the right
 *  modern template. Any code that reads template from DB / webhook / URL
 *  should funnel through `normalizeTemplate` first. */
export {
  CERTIFICATE_TEMPLATES,
  getCertificateTemplateQueryParam,
  isAcceptedCertificateTemplate,
  LEGACY_CERTIFICATE_TEMPLATES,
  normalizeTemplate,
} from "@/lib/certificate-templates";
export type {
  AcceptedCertificateTemplate,
  CertificateTemplate,
  LegacyCertificateTemplate,
} from "@/lib/certificate-templates";

export type CertificateDocumentProps = {
  name: string;
  tier: string;
  dedication?: string | null;
  date: string;
  registryId: string;
  referralCode?: string;
  priorityImages?: boolean;
  className?: string;
  template?: CertificateTemplate;
  assetMode?: "preview" | "full";
  paperFormat?: PaperFormat;
  locale?: string;
};

function getTierColorClass(tier: string) {
  const normalized = tier?.toLowerCase() ?? "";
  if (normalized === "nonsnack" || normalized.includes("non-snack")) {
    return "certificate-tier--nonsnack";
  }
  if (normalized === "business" || normalized.includes("zone")) {
    return "certificate-tier--business";
  }
  return "certificate-tier--protected";
}

export function CertificateDocument({
  name,
  tier,
  dedication,
  date,
  registryId,
  referralCode,
  priorityImages = false,
  template = "luxury",
  assetMode = priorityImages ? "full" : "preview",
  paperFormat = "a4",
  locale,
}: CertificateDocumentProps) {
  const copy = getCertificateDisplayCopy(locale);
  const tierKey = getCertificateTierKey(tier);
  const statusText = copy.tierLabels[tierKey];
  const ribbonStatusText = copy.ribbonLabels[tierKey];
  const filedUnderText = copy.filedUnderLabels[tierKey];
  const tierColorClass = getTierColorClass(tier);
  const dedicationText = dedication?.trim() ?? "";
  const playfulRecipientClassName = [
    "playful-recipient-name",
    name.length > 20 ? "playful-recipient-name--long" : "",
    name.length > 30 ? "playful-recipient-name--xlong" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const playfulRibbonClassName = [
    "playful-ribbon-text",
    tierColorClass,
    ribbonStatusText.length > 22 ? "playful-ribbon-text--long" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const playfulStatusClassName = [
    "playful-status",
    tierColorClass,
    statusText.length > 18 ? "playful-status--long" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const recipientNameClassName = [
    "lux-recipient-name",
    name.length > 20 ? "lux-recipient-name--long" : "",
    name.length > 30 ? "lux-recipient-name--xlong" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const tokenBase = getCertificateHumorSeed(name, registryId, tier);
  const diplomaticNote = getCertificateDiplomaticNote(tokenBase, locale);
  const footerAside = getCertificateFooterAside(tokenBase, locale);
  const resolvedTemplate = normalizeTemplate(template);
  const isClassic = resolvedTemplate === "classic";
  const isLuxury = resolvedTemplate === "luxury";
  const isPlayful = resolvedTemplate === "playful";
  const isLetter = paperFormat === "letter";
  const isLuxuryA4 = isLuxury && !isLetter;

  const verifyUrl = getVerificationUrl(
    registryId.toLowerCase(),
    undefined,
    undefined,
    referralCode,
  );
  const luxuryA4Background =
    tierKey === "business"
      ? assetMode === "preview"
        ? "/background-luxury-a4-business-preview.webp"
        : "/background-luxury-a4-business.png"
      : tierKey === "nonsnack"
      ? assetMode === "preview"
        ? "/background-luxury-a4-nonsnack-preview.webp"
        : "/background-luxury-a4-nonsnack.png"
      : assetMode === "preview"
        ? "/background-luxury-a4-preview.webp"
        : "/background-luxury-a4.png";
  const backgroundSrc = isLuxury
    ? isLuxuryA4
      ? luxuryA4Background
      : assetMode === "preview"
        ? "/background-luxury-preview.webp"
        : "/background-luxury.png"
    : isClassic
      ? assetMode === "preview"
        ? "/background-formal-preview.webp"
        : "/background-formal.png"
      : isLetter
        ? "/background-playful-us-v1.png"
        : "/background-playful-v2.png";
  const qrSrc = getQrCodeUrl(verifyUrl, 200);

  return (
    <div
      className={`certificate-page certificate-page--${resolvedTemplate} certificate-page--paper-${paperFormat}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backgroundSrc}
        alt=""
        className={`certificate-bg${isClassic ? " certificate-bg--classic" : ""}${isLuxury ? " certificate-bg--luxury" : ""}`}
      />

      <div className="certificate-inner-frame" />

      {/* Luxury A4 layout - text overlay on border-only art */}
      {isLuxuryA4 && (
        <>
          <div className="lux-a4-title-block">
            <span className="lux-a4-title-certificate">{copy.certificate}</span>
            <span className="lux-a4-title-of">{copy.of}</span>
            <span className="lux-a4-title-recognition">{copy.officialRecognition}</span>
          </div>

          <div className="lux-a4-issuer-block">
            <span className="lux-a4-issuer-intro">{copy.issuedBy}</span>
            <span className="lux-a4-issuer-org">{copy.organization}</span>
            <span className="lux-a4-issuer-dept">{copy.department}</span>
          </div>

          {/* Subtle decorative fleuron — section breakpoint between issuer and recipient. */}
          <div className="lux-a4-flourish lux-a4-flourish--top" aria-hidden="true">
            <span className="lux-a4-flourish-rule" />
            <span className="lux-a4-flourish-glyph">❦</span>
            <span className="lux-a4-flourish-rule" />
          </div>

          <div className="lux-a4-intro">{copy.playfulIntro}</div>

          <div className="lux-a4-recipient-block">
            <span className={recipientNameClassName}>{name}</span>
          </div>

          <div className="lux-a4-status-label">{copy.playfulStatusLabel}</div>

          {/* Decorative flourishes flanking the tier status — engraved feel. */}
          <div className={`lux-a4-status ${tierColorClass}`}>
            <span className="lux-a4-status-flourish" aria-hidden="true">✦</span>
            <span className="lux-a4-status-text">{statusText}</span>
            <span className="lux-a4-status-flourish" aria-hidden="true">✦</span>
          </div>

          <div className="lux-a4-body">{copy.playfulBody}</div>

          <div className="lux-a4-meta-row" aria-label={copy.verificationDetails}>
            <div className="lux-a4-meta-item lux-a4-meta-item--qr">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc} alt={copy.verifyMembership} className="lux-a4-qr-image" />
              <div className="lux-a4-qr-label">{copy.verifyMembership}</div>
            </div>
            <div className="lux-a4-record">
              <div className="lux-a4-record-item">
                <div className="lux-a4-record-label">{copy.dateOfRecognition}</div>
                <div className="lux-a4-record-value">{date}</div>
              </div>
              <div className="lux-a4-record-item" translate="no">
                <div className="lux-a4-record-label">{copy.registryId}</div>
                <div className="lux-a4-record-value">{registryId}</div>
              </div>
            </div>
          </div>

          <div className="lux-a4-signature lux-a4-signature--left">
            <div className="lux-a4-signature-cursive" aria-hidden="true">
              Finnley Mako
            </div>
            <div className="lux-a4-signature-name">Finnley Mako</div>
            <div className="lux-a4-signature-role">
              {copy.finnleyPlayfulRole}
              <br />
              {copy.finnleyPlayfulAside}
            </div>
          </div>

          <div className="lux-a4-signature lux-a4-signature--right">
            <div className="lux-a4-signature-cursive" aria-hidden="true">
              Luna Reef
            </div>
            <div className="lux-a4-signature-name">Luna Reef</div>
            <div className="lux-a4-signature-role">
              {copy.lunaPlayfulRole}
              <br />
              {copy.lunaPlayfulAside}
            </div>
          </div>

          <div className="lux-a4-remarks">
            <div className="lux-a4-remarks-heading">{copy.assessmentLabel}</div>
            <p>{copy.assessmentText}</p>
            <p className="lux-a4-remarks-note">
              <span>
                {dedicationText ? copy.dedicationLabel : copy.marineNoteLabel}
              </span>
              {dedicationText || diplomaticNote}
            </p>
          </div>

          <footer className="lux-a4-footer-block">
            {copy.symbolicDisclaimer}
          </footer>
        </>
      )}

      {/* Legacy Luxury layout - retained for US Letter until it receives its own art */}
      {isLuxury && !isLuxuryA4 && (
        <>
          <div className="lux-title-block">
            <span className="lux-title-certificate">{copy.certificate}</span>
            <span className="lux-title-of">{copy.of}</span>
            <span className="lux-title-recognition">{copy.officialRecognition}</span>
          </div>

          <div className="lux-issuer-block">
            <span className="lux-issuer-intro">{copy.issuedBy}</span>
            <span className="lux-issuer-org">{copy.organization}</span>
            <span className="lux-issuer-dept">{copy.department}</span>
          </div>

          <aside
            className="lux-verification-block"
            aria-label={copy.verificationDetails}
          >
            <div className="lux-qr-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc} alt={copy.verifyMembership} className="lux-qr-image" />
            </div>
          </aside>

          <div className="lux-recipient-block">
            <span className={recipientNameClassName}>{name}</span>
          </div>

          <div className="lux-status-label-block">
            {copy.earnedLine1}
            <br />
            {copy.earnedLine2}
          </div>

          <div
            className={`lux-status-block ${tierColorClass}${tier.toLowerCase().includes("nonsnack") || tier.toLowerCase().includes("non-snack") ? " lux-status-block--nonsnack" : ""}${tier.toLowerCase().includes("business") || tier.toLowerCase().includes("zone") ? " lux-status-block--business" : ""}`}
          >
            {statusText}
          </div>

          <div className="lux-body-block">{copy.body}</div>

          {/* Dedication block: shows the user's recorded dedication if any,
              otherwise falls back to an auto-generated diplomatic marine note,
              so the bottom of the certificate always carries a personalized
              line of copy. */}
          <div className="lux-dedication-block">
            <span className="lux-dedication-label">
              {dedicationText ? copy.dedicationLabel : copy.marineNoteLabel}
            </span>
            <span className="lux-dedication-text">
              &ldquo;{dedicationText || diplomaticNote}&rdquo;
            </span>
          </div>

          <div className="lux-meta-block" aria-label={copy.verificationDetails}>
            <span className="lux-meta-line">
              <span className="lux-meta-kicker">{copy.recognized}</span>
              <span className="lux-meta-date">{date}</span>
            </span>
            <span className="lux-meta-line">
              <span className="lux-meta-kicker">{copy.registry}</span>
              <span className="lux-meta-id" translate="no">
                {registryId}
              </span>
            </span>
          </div>

          <div className="lux-sig-finnley">
            <span className="lux-sig-name">Finnley Mako</span>
            <span className="lux-sig-role">{copy.finnleyRole}</span>
          </div>
          <div className="lux-sig-luna">
            <span className="lux-sig-name">Luna Reef</span>
            <span className="lux-sig-role">{copy.lunaRole}</span>
          </div>

          <footer className="lux-footer-block">
            {copy.symbolicDisclaimer}{" "}
            &ldquo;{footerAside}&rdquo;
          </footer>
        </>
      )}

      {/* Formal layout - parchment overlay blocks */}
      {isClassic && (
        <>
          <div className="cls-title-block">
            <span className="cls-kicker">{copy.organization}</span>
            <span className="cls-title-main">
              {copy.certificate} {copy.of} {copy.officialRecognition}
            </span>
            <span className="cls-title-sub">{copy.department}</span>
          </div>

          <div className="cls-qr-block">
            <span className="cls-qr-label">{copy.verify}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt={copy.verifyMembership} className="cls-qr-image" />
          </div>

          <div className="cls-recipient-block">
            <span className="cls-recipient-name">{name}</span>
          </div>

          <div className="cls-status-label-block">
            {copy.earnedLine1}
            <br />
            {copy.earnedLine2}
          </div>

          <div
            className={`cls-status-block${tier.toLowerCase().includes("nonsnack") || tier.toLowerCase().includes("non-snack") ? " cls-status-block--nonsnack" : ""}${tier.toLowerCase().includes("business") || tier.toLowerCase().includes("zone") ? " cls-status-block--business" : ""}`}
          >
            {statusText}
          </div>

          <div className="cls-body-block">{copy.body}</div>

          {/* Always renders. Falls back to an auto-generated diplomatic note
              when the user did not provide a personal dedication, so the
              certificate always carries a personalized line. */}
          <div className="cls-dedication-block">
            <span className="cls-dedication-label">
              {dedicationText ? copy.dedicationLabel : copy.marineNoteLabel}
            </span>
            <span className="cls-dedication-text">
              &ldquo;{dedicationText || diplomaticNote}&rdquo;
            </span>
          </div>

          <div className="cls-sig-left">
            <span className="cls-sig-name">Finnley Mako</span>
            <span className="cls-sig-role">{copy.finnleyRole}</span>
          </div>
          <div className="cls-sig-right">
            <span className="cls-sig-name">Luna Reef</span>
            <span className="cls-sig-role">{copy.lunaRole}</span>
          </div>

          <div className="cls-meta-block">
            <div className="cls-meta-item">
              <span className="cls-meta-label">{copy.dateOfRecognition}</span>
              <span className="cls-meta-value">{date}</span>
            </div>
            <div className="cls-meta-item">
              <span className="cls-meta-label">{copy.registryId}</span>
              <span className="cls-meta-value">{registryId}</span>
            </div>
          </div>

          <div className="cls-footer-left">{copy.symbolicDisclaimer}</div>
          <div className="cls-footer-right">
            &ldquo;{footerAside}&rdquo;
          </div>
        </>
      )}

      {/* Hero layout */}
      {isPlayful && (
        <section
          className={`certificate-content certificate-content--playful${isLetter ? " certificate-content--playful-letter" : ""}`}
        >
          <div className={playfulRibbonClassName}>{ribbonStatusText}</div>

          <div className="playful-intro">{copy.playfulIntro}</div>

          <div className={playfulRecipientClassName}>{name}</div>

          <div className="playful-status-label">{copy.playfulStatusLabel}</div>

          <div className={playfulStatusClassName}>{statusText}</div>

          <div className="playful-body">{copy.playfulBody}</div>

          <div className="playful-meta-row" aria-label={copy.verificationDetails}>
            <div className="playful-meta-item">
              <div className="playful-meta-label">{copy.dateOfRecognition}</div>
              <div className="playful-meta-value">{date}</div>
            </div>
            <div className="playful-meta-item">
              <div className="playful-meta-label">{copy.registryId}</div>
              <div className="playful-meta-value" translate="no">
                {registryId}
              </div>
            </div>
            <div className="playful-meta-item">
              <div className="playful-meta-label">{copy.filedUnder}</div>
              <div className="playful-meta-value">{filedUnderText}</div>
            </div>
          </div>

          <div className="playful-signature playful-signature--left">
            <div className="playful-signature-name">Finnley Mako</div>
            <div className="playful-signature-role">
              {copy.finnleyPlayfulRole}
              <br />
              {copy.finnleyPlayfulAside}
            </div>
          </div>

          <div className="playful-signature playful-signature--right">
            <div className="playful-signature-name">Luna Reef</div>
            <div className="playful-signature-role">
              {copy.lunaPlayfulRole}
              <br />
              {copy.lunaPlayfulAside}
            </div>
          </div>

          <div className={`playful-box playful-box--assessment ${tierColorClass}`}>
            <div className="playful-box-label">{copy.assessmentLabel}</div>
            <p>{copy.assessmentText}</p>
          </div>

          <div className="playful-box playful-box--note">
            <div className="playful-box-label">
              {dedicationText ? copy.dedicationLabel : copy.marineNoteLabel}
            </div>
            <p>{dedicationText || diplomaticNote}</p>
          </div>

          <div className="playful-box playful-box--qr" aria-label={copy.verificationDetails}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt={copy.verifyMembership}
              className="playful-qr-image"
            />
            <div className="playful-qr-label">{copy.verifyMembership}</div>
          </div>

          <div className="playful-footer-note">
            {copy.symbolicDisclaimer} &ldquo;{footerAside}&rdquo;
          </div>
        </section>
      )}
    </div>
  );
}
