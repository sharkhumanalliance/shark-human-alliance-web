import {
  getCertificateDiplomaticNote,
  getCertificateFooterAside,
  getCertificateHumorSeed,
} from "@/lib/certificate-humor";
import {
  getCertificateDisplayCopy,
  getCertificateTierKey,
} from "@/lib/certificate-display-copy";
import { getQrCodeUrl, getVerificationUrl } from "@/lib/qr-svg";
import type { PaperFormat } from "./certificate-sheet";

export type CertificateTemplate = "hero" | "formal" | "luxury";

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
  const isFormal = template === "formal";
  const isLuxury = template === "luxury";
  const isLetter = paperFormat === "letter";

  const verifyUrl = getVerificationUrl(
    registryId.toLowerCase(),
    undefined,
    undefined,
    referralCode,
  );
  const backgroundSrc = isLuxury
    ? assetMode === "preview"
      ? "/background-luxury-preview.webp"
      : "/background-luxury.png"
    : isFormal
      ? assetMode === "preview"
        ? "/background-formal-preview.webp"
        : "/background-formal.png"
      : isLetter
        ? "/background-playful-us-v1.png"
        : "/background-playful-v2.png";
  const qrSrc = getQrCodeUrl(verifyUrl, 200);

  return (
    <div
      className={`certificate-page certificate-page--${template} certificate-page--paper-${paperFormat}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backgroundSrc}
        alt=""
        className={`certificate-bg${isFormal ? " certificate-bg--formal" : ""}${isLuxury ? " certificate-bg--luxury" : ""}`}
      />

      <div className="certificate-inner-frame" />

      {/* Luxury layout - absolutely positioned overlay blocks */}
      {isLuxury && (
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

          {dedicationText ? (
            <div className="lux-dedication-block">
              <span className="lux-dedication-text">
                &ldquo;{dedicationText}&rdquo;
              </span>
            </div>
          ) : null}

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
      {isFormal && (
        <>
          <div className="frm-title-block">
            <span className="frm-kicker">{copy.organization}</span>
            <span className="frm-title-main">
              {copy.certificate} {copy.of} {copy.officialRecognition}
            </span>
            <span className="frm-title-sub">{copy.department}</span>
          </div>

          <div className="frm-qr-block">
            <span className="frm-qr-label">{copy.verify}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt={copy.verifyMembership} className="frm-qr-image" />
          </div>

          <div className="frm-recipient-block">
            <span className="frm-recipient-name">{name}</span>
          </div>

          <div className="frm-status-label-block">
            {copy.earnedLine1}
            <br />
            {copy.earnedLine2}
          </div>

          <div
            className={`frm-status-block${tier.toLowerCase().includes("nonsnack") || tier.toLowerCase().includes("non-snack") ? " frm-status-block--nonsnack" : ""}${tier.toLowerCase().includes("business") || tier.toLowerCase().includes("zone") ? " frm-status-block--business" : ""}`}
          >
            {statusText}
          </div>

          <div className="frm-body-block">{copy.body}</div>

          {dedicationText ? (
            <div className="frm-dedication-block">
              <span className="frm-dedication-label">{copy.dedicationLabel}</span>
              <span className="frm-dedication-text">
                &ldquo;{dedicationText}&rdquo;
              </span>
            </div>
          ) : null}

          <div className="frm-sig-left">
            <span className="frm-sig-name">Finnley Mako</span>
            <span className="frm-sig-role">{copy.finnleyRole}</span>
          </div>
          <div className="frm-sig-right">
            <span className="frm-sig-name">Luna Reef</span>
            <span className="frm-sig-role">{copy.lunaRole}</span>
          </div>

          <div className="frm-meta-block">
            <div className="frm-meta-item">
              <span className="frm-meta-label">{copy.dateOfRecognition}</span>
              <span className="frm-meta-value">{date}</span>
            </div>
            <div className="frm-meta-item">
              <span className="frm-meta-label">{copy.registryId}</span>
              <span className="frm-meta-value">{registryId}</span>
            </div>
          </div>

          <div className="frm-footer-left">{copy.symbolicDisclaimer}</div>
          <div className="frm-footer-right">
            &ldquo;{footerAside}&rdquo;
          </div>
        </>
      )}

      {/* Hero layout */}
      {!isLuxury && !isFormal && (
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
            {copy.filedUnderPrefix}: {filedUnderText}
          </div>
        </section>
      )}
    </div>
  );
}
