import Image from "next/image";
import { getQrCodeUrl, getVerificationUrl } from "@/lib/qr-svg";

export type CertificateTemplate = "hero" | "formal";

export type CertificateDocumentProps = {
  name: string;
  tier: string;
  dedication?: string | null;
  date: string;
  registryId: string;
  /** Reserved for future i18n — not actively used yet. */
  t?: (key: string) => string;
  priorityImages?: boolean;
  className?: string;
  template?: CertificateTemplate;
};

const HUMOR_NOTES = [
  "The holder has been classified as diplomatically uninteresting from a shark culinary perspective.",
  "Independent review suggests the holder is more valuable as a conversation partner than as a meal.",
  "The Alliance has reason to believe that most sharks would simply swim past and continue minding their business.",
  "Current diplomatic intelligence indicates that eating the holder would reflect poorly on shark judgment and table manners.",
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
  priorityImages = false,
  template = "hero",
}: CertificateDocumentProps) {
  const statusText = getTierLabel(tier);
  const tierColorClass = getTierColorClass(tier);
  const tokenBase = `${name}-${registryId}-${tier}`;
  const diplomaticNote = getDiplomaticNote(tokenBase);
  const footerAside = getFooterAside(tokenBase);
  const isFormal = template === "formal";

  const verifyUrl = getVerificationUrl(registryId.toLowerCase());
  const qrSrc = getQrCodeUrl(verifyUrl, 200);

  return (
    <div className={`certificate-page certificate-page--${template}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={isFormal ? "/background-formal.png" : "/background-final.PNG"}
        alt=""
        className={`certificate-bg${isFormal ? " certificate-bg--formal" : ""}`}
      />

      <div className="certificate-inner-frame" />

      {isFormal ? (
        <section className="certificate-formal-top">
          <div className="certificate-formal-kicker">SHARK HUMAN ALLIANCE</div>
          <div className="certificate-formal-ornament" />
          <div className="certificate-formal-subtitle">
            Office of Interspecies Diplomatic Affairs
          </div>
        </section>
      ) : (
        <section className="certificate-hero">
          <Image
            src="/cert-shark.jpg"
            alt=""
            fill
            priority={priorityImages}
            className="certificate-hero-image"
          />
          <div className="certificate-hero-overlay" />
          <div className="certificate-hero-question">
            Are you afraid of sharks?
          </div>
        </section>
      )}

      <section className="certificate-content">
        {!isFormal && (
          <header className="certificate-header">
            <div className="certificate-org">SHARK HUMAN ALLIANCE</div>
            <div className="certificate-org-subtitle">
              Office of Interspecies Diplomatic Affairs
            </div>
          </header>
        )}

        <div className="certificate-rule" />

        <h1 className={`certificate-title${isFormal ? " certificate-title--formal" : ""}`}>
          Certificate of Alliance Membership
        </h1>

        <div className="certificate-rule" />

        <p className="certificate-intro">
          {isFormal
            ? "This certifies that"
            : "This document officially certifies that the esteemed"}
        </p>

        <div className="certificate-name-wrap">
          <div className="certificate-name">{name}</div>
        </div>

        <p className="certificate-status-label">
          {isFormal
            ? "has been designated a"
            : "has been granted the status of"}
        </p>

        <div className={`certificate-status ${tierColorClass}`}>{statusText}</div>

        <div className={`certificate-main${isFormal ? " certificate-main--formal" : ""}`}>
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

        <footer className="certificate-footer">
          <div className="certificate-footer-main">
            This document is officially symbolic and diplomatically
            non-binding. Sharks cannot read, do not recognize human
            bureaucracy, and remain largely unaware of our existence.
          </div>

          <div className="certificate-footer-aside">
            Your purchase does, however, support very real ocean
            conservation — which is more than most certificates can say.
            &ldquo;{footerAside}&rdquo;
          </div>
        </footer>
      </section>
    </div>
  );
}

export default CertificateDocument;
