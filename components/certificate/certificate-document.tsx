import Image from "next/image";
import { getQrCodeUrl, getVerificationUrl } from "@/lib/qr-svg";

export type CertificateTemplate = "hero" | "formal" | "luxury";

export type CertificateDocumentProps = {
  name: string;
  tier: string;
  dedication?: string | null;
  date: string;
  registryId: string;
  referralCode?: string;
  /** Reserved for future i18n — not actively used yet. */
  t?: (key: string) => string;
  priorityImages?: boolean;
  className?: string;
  template?: CertificateTemplate;
  assetMode?: "preview" | "full";
};

const HUMOR_NOTES = [
  "The holder has been classified as diplomatically uninteresting from a shark culinary perspective.",
  "Independent review suggests the holder is more valuable as a conversation partner than as a meal.",
  "The Alliance has reason to believe that most sharks would simply swim past and continue minding their business.",
  "Current diplomatic guidance suggests the holder would make a poor culinary decision.",
  "The holder is provisionally recognized as a low-priority snack candidate pending further marine review.",
  "No shark has formally objected to the holder's Protected Friend status at the time of issuance.",
  "The Office notes that the holder appears statistically more useful alive, framed, and mildly reassured.",
  "Marine diplomacy remains ongoing, but early indicators are cautiously and stylishly encouraging.",
];

const FOOTER_ASIDES = [
  "To date, no shark has filed a formal objection — largely because they cannot hold a pen.",
  "The Alliance has attempted to notify the shark community. The ocean did not reply.",
  "This recognition has not been challenged by any known marine authority, mostly due to jurisdictional confusion.",
  "The holder is advised not to present this certificate to an actual shark. They will not be impressed.",
  "Printed on 100% symbolic paper. Any resemblance to actual legal protection is purely aspirational.",
  "The Department of Misunderstanding Prevention reminds you: sharks do not honor paperwork.",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDiplomaticNote(input: string) {
  const index = hashString(input) % HUMOR_NOTES.length;
  return HUMOR_NOTES[index];
}

function getFooterAside(input: string) {
  const index = hashString(`footer-${input}`) % FOOTER_ASIDES.length;
  return FOOTER_ASIDES[index];
}

function getTierLabel(tier: string) {
  const normalized = tier?.toLowerCase() ?? "";
  if (normalized === "nonsnack" || normalized.includes("non-snack"))
    return "Non-Snack Recognition";
  if (normalized === "business" || normalized.includes("zone"))
    return "Shark-Approved Zone";
  return "Protected Friend";
}

function getTierColorClass(tier: string) {
  const normalized = tier?.toLowerCase() ?? "";
  if (normalized === "nonsnack" || normalized.includes("non-snack"))
    return "certificate-tier--nonsnack";
  if (normalized === "business" || normalized.includes("zone"))
    return "certificate-tier--business";
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
}: CertificateDocumentProps) {
  const statusText = getTierLabel(tier);
  const tierColorClass = getTierColorClass(tier);
  const dedicationText = dedication?.trim() ?? "";
  const recipientNameClassName = [
    "lux-recipient-name",
    name.length > 20 ? "lux-recipient-name--long" : "",
    name.length > 30 ? "lux-recipient-name--xlong" : "",
  ].filter(Boolean).join(" ");
  const tokenBase = `${name}-${registryId}-${tier}`;
  const diplomaticNote = getDiplomaticNote(tokenBase);
  const footerAside = getFooterAside(tokenBase);
  const isFormal = template === "formal";
  const isLuxury = template === "luxury";

  const verifyUrl = getVerificationUrl(registryId.toLowerCase(), undefined, undefined, referralCode);
  const backgroundSrc = isLuxury
    ? assetMode === "preview" ? "/background-luxury-preview.webp" : "/background-luxury.png"
    : isFormal
      ? assetMode === "preview" ? "/background-formal-preview.webp" : "/background-formal.png"
      : assetMode === "preview" ? "/background-final-preview.webp" : "/background-final.PNG";
  const heroImageSrc = "/are-you-afraid.png";
  const qrSrc = getQrCodeUrl(verifyUrl, 200);

  return (
    <div className={`certificate-page certificate-page--${template}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backgroundSrc}
        alt=""
        className={`certificate-bg${isFormal ? " certificate-bg--formal" : ""}${isLuxury ? " certificate-bg--luxury" : ""}`}
      />

      <div className="certificate-inner-frame" />

      {/* Hero banner image — only for hero template */}
      {!isLuxury && !isFormal && (
        <section className="certificate-hero">
          <Image
            src={heroImageSrc}
            alt=""
            fill
            priority={priorityImages}
            className="certificate-hero-image"
          />
        </section>
      )}

      {/* ── LUXURY LAYOUT — absolutely positioned overlay blocks ── */}
      {isLuxury && (
        <>
          {/* Title block */}
          <div className="lux-title-block">
            <span className="lux-title-certificate">Certificate</span>
            <span className="lux-title-of">of</span>
            <span className="lux-title-recognition">Official Recognition</span>
          </div>

          {/* Issuer block */}
          <div className="lux-issuer-block">
            <span className="lux-issuer-intro">Issued by the</span>
            <span className="lux-issuer-org">Shark Human Alliance</span>
            <span className="lux-issuer-dept">Department of Interspecies Diplomacy</span>
          </div>

          {/* Verification block — smaller QR with grouped metadata */}
          <aside className="lux-verification-block" aria-label="Verification details">
            <div className="lux-qr-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                alt="Verify membership"
                className="lux-qr-image"
              />
            </div>
          </aside>

          {/* Recipient name */}
          <div className="lux-recipient-block">
            <span className={recipientNameClassName}>{name}</span>
          </div>

          {/* Status label */}
          <div className="lux-status-label-block">
            has earned the trust and respect of the wider marine<br />
            community and is hereby declared a:
          </div>

          {/* Status title */}
          <div className={`lux-status-block ${tierColorClass}${tier.toLowerCase().includes("nonsnack") || tier.toLowerCase().includes("non-snack") ? " lux-status-block--nonsnack" : ""}${tier.toLowerCase().includes("business") || tier.toLowerCase().includes("zone") ? " lux-status-block--business" : ""}`}>
            {statusText}
          </div>

          {/* Body text — short, max 3 lines */}
          <div className="lux-body-block">
            This certifies that the holder is officially recognized by the
            Shark Human Alliance as a supporter of peaceful shark-human
            relations and a contributor to real ocean conservation.
          </div>

          {dedicationText ? (
            <div className="lux-dedication-block">
              <span className="lux-dedication-text">&ldquo;{dedicationText}&rdquo;</span>
            </div>
          ) : null}

          <div className="lux-meta-block" aria-label="Certificate registry details">
            <span className="lux-meta-line">
              <span className="lux-meta-kicker">Recognized</span>
              <span className="lux-meta-date">{date}</span>
            </span>
            <span className="lux-meta-line">
              <span className="lux-meta-kicker">Registry</span>
              <span className="lux-meta-id" translate="no">{registryId}</span>
            </span>
          </div>

          {/* Signature labels — over background fin + Luna Reef */}
          <div className="lux-sig-finnley">
            <span className="lux-sig-name">Finnley Mako</span>
            <span className="lux-sig-role">Shark Spokesperson</span>
          </div>
          <div className="lux-sig-luna">
            <span className="lux-sig-name">Luna Reef</span>
            <span className="lux-sig-role">Dept. of Misunderstanding Prevention</span>
          </div>

          {/* Footer — micro-text, left, below frame */}
          <footer className="lux-footer-block">
            This document is officially symbolic and diplomatically non-binding.
            Sharks cannot read, do not recognize human bureaucracy, and remain
            largely unaware of our existence. Your purchase supports real ocean
            conservation — which is more than most certificates can say.
            &ldquo;{footerAside}&rdquo;
          </footer>
        </>
      )}

      {/* ── FORMAL LAYOUT — parchment overlay blocks ── */}
      {isFormal && (
        <>
          <div className="frm-title-block">
            <span className="frm-kicker">Shark Human Alliance</span>
            <span className="frm-title-main">Certificate of Official Recognition</span>
            <span className="frm-title-sub">Department of Interspecies Diplomacy</span>
          </div>

          <div className="frm-qr-block">
            <span className="frm-qr-label">Verify</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt="Verify membership" className="frm-qr-image" />
          </div>

          <div className="frm-recipient-block">
            <span className="frm-recipient-name">{name}</span>
          </div>

          <div className="frm-status-label-block">
            has earned the trust and respect of the wider marine<br />
            community and is hereby declared a:
          </div>

          <div className={`frm-status-block${tier.toLowerCase().includes("nonsnack") || tier.toLowerCase().includes("non-snack") ? " frm-status-block--nonsnack" : ""}${tier.toLowerCase().includes("business") || tier.toLowerCase().includes("zone") ? " frm-status-block--business" : ""}`}>
            {statusText}
          </div>

          <div className="frm-body-block">
            This certifies that the holder is officially recognized by the
            Shark Human Alliance as a supporter of peaceful shark-human
            relations and a contributor to real ocean conservation.
          </div>

          {dedicationText ? (
            <div className="frm-dedication-block">
              <span className="frm-dedication-label">Recorded dedication</span>
              <span className="frm-dedication-text">&ldquo;{dedicationText}&rdquo;</span>
            </div>
          ) : null}

          <div className="frm-sig-left">
            <span className="frm-sig-name">Finnley Mako</span>
            <span className="frm-sig-role">Shark Spokesperson</span>
          </div>
          <div className="frm-sig-right">
            <span className="frm-sig-name">Luna Reef</span>
            <span className="frm-sig-role">Dept. of Misunderstanding Prevention</span>
          </div>

          <div className="frm-meta-block">
            <div className="frm-meta-item">
              <span className="frm-meta-label">Date of Recognition</span>
              <span className="frm-meta-value">{date}</span>
            </div>
            <div className="frm-meta-item">
              <span className="frm-meta-label">Registry ID</span>
              <span className="frm-meta-value">{registryId}</span>
            </div>
          </div>

          <div className="frm-footer-left">
            This document is officially symbolic and diplomatically non-binding.
            Sharks cannot read, do not recognize human bureaucracy, and remain
            largely unaware of our existence.
          </div>
          <div className="frm-footer-right">
            Your purchase supports real ocean conservation — which is more than
            most certificates can say. &ldquo;{footerAside}&rdquo;
          </div>
        </>
      )}

      {/* ── HERO LAYOUT ── */}
      {!isLuxury && !isFormal && (
        <section className="certificate-content">
          <div className="certificate-charter-panel">
            <header className="certificate-header">
              <div className="certificate-org">SHARK HUMAN ALLIANCE</div>
              <div className="certificate-org-subtitle">
                Department of Interspecies Diplomatic Affairs
              </div>
            </header>

            <div className="certificate-rule" />

            <h1 className="certificate-title">
              Certificate of Official Recognition
            </h1>

            <div className="certificate-rule" />
          </div>

          <div className="certificate-award-panel">
            <p className="certificate-intro">
              This document officially certifies that the esteemed
            </p>

            <div className="certificate-name-wrap">
              <div className="certificate-name">{name}</div>
            </div>

            <p className="certificate-status-label">
              has earned the trust and respect of the wider marine community
              and is hereby declared a:
            </p>

            <div className={`certificate-status ${tierColorClass}${tier.toLowerCase().includes("nonsnack") || tier.toLowerCase().includes("non-snack") ? " certificate-status--nonsnack" : ""}`}>
              {statusText}
            </div>
          </div>

          <div className="certificate-main">
            <div className="certificate-copy-column">
              <p className="certificate-body">
                This certifies that the holder is officially recognized by the
                Shark Human Alliance as a supporter of peaceful shark-human
                relations and a contributor to real ocean conservation.
              </p>

              <div className={`certificate-verdict ${tierColorClass}`}>
                <div className="certificate-box-label">Diplomatic assessment</div>
                <p>
                  Any shark considering the holder a meal would be demonstrating
                  exceptionally poor judgment.
                </p>
              </div>

              {dedication ? (
                <div className="certificate-note">
                  <div className="certificate-box-label">
                    Recorded dedication
                  </div>
                  <p>{dedication}</p>
                </div>
              ) : (
                <div className="certificate-note">
                  <div className="certificate-box-label">
                    Supplementary marine note
                  </div>
                  <p>{diplomaticNote}</p>
                </div>
              )}
            </div>

            <div className="certificate-seal-column">
              <Image
                src="/cert-seal.png"
                alt="SHA seal"
                width={420}
                height={420}
                className="certificate-seal"
                priority={priorityImages}
              />
              <div className="certificate-seal-caption">
                Filed under: Non-snack diplomacy
              </div>
            </div>
          </div>

          <div className="certificate-record-zone">
            <div className="certificate-meta">
              <div className="certificate-meta-item">
                <div className="certificate-meta-label">
                  Date of Diplomatic Recognition
                </div>
                <div className="certificate-meta-value">{date}</div>
              </div>

              <div className="certificate-meta-item">
                <div className="certificate-meta-label">Registry ID</div>
                <div className="certificate-meta-value">{registryId}</div>
              </div>
            </div>

            <div className="certificate-bottom-row">
              <div className="certificate-signatures">
                <div className="certificate-signature">
                  <div className="certificate-signature-name">Finnley Mako</div>
                  <div className="certificate-signature-role">
                    Chief Diplomat SHA &amp; Press Spokesperson
                    <br />
                    (and Optimist)
                  </div>
                </div>

                <div className="certificate-signature">
                  <div className="certificate-signature-name">Luna Reef</div>
                  <div className="certificate-signature-role">
                    Head of Culinary Inspection
                    <br />
                    &amp; Dept. of Misunderstanding Prevention
                  </div>
                </div>
              </div>

              <div className="certificate-qr">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrSrc}
                  alt="Verify membership"
                  className="certificate-qr-image"
                />
                <div className="certificate-qr-label">Verify membership</div>
              </div>
            </div>
          </div>

          <footer className="certificate-footer">
            <div className="certificate-footer-main">
              This document is officially symbolic and diplomatically non-binding.
              Sharks cannot read, do not recognize human bureaucracy, and remain
              largely unaware of our existence. Your purchase supports real ocean
              conservation — which is more than most certificates can say.
            </div>
            <div className="certificate-footer-aside">&ldquo;{footerAside}&rdquo;</div>
          </footer>
        </section>
      )}
    </div>
  );
}
