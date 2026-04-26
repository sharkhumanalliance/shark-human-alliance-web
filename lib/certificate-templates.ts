export type CertificateTemplate = "playful" | "classic" | "luxury";
export type LegacyCertificateTemplate = "hero" | "formal";
export type AcceptedCertificateTemplate =
  | CertificateTemplate
  | LegacyCertificateTemplate;

export const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  "playful",
  "classic",
  "luxury",
];

export const LEGACY_CERTIFICATE_TEMPLATES: LegacyCertificateTemplate[] = [
  "hero",
  "formal",
];

export function isAcceptedCertificateTemplate(
  value?: string | null,
): value is AcceptedCertificateTemplate {
  return (
    value === "playful" ||
    value === "classic" ||
    value === "luxury" ||
    value === "hero" ||
    value === "formal"
  );
}

export function getCertificateTemplateQueryParam(value?: string | null) {
  return isAcceptedCertificateTemplate(value)
    ? `&template=${encodeURIComponent(value)}`
    : "";
}

/** Legacy IDs are kept so rows or Stripe metadata written before the rename
 *  ("hero" -> "playful", "formal" -> "classic") resolve to modern templates.
 */
export function normalizeTemplate(value?: string | null): CertificateTemplate {
  if (value === "hero") return "playful";
  if (value === "formal") return "classic";
  if (value === "playful" || value === "classic" || value === "luxury") {
    return value;
  }
  return "luxury";
}
