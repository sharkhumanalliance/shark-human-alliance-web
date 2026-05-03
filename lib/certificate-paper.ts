import {
  normalizeTemplate,
  type CertificateTemplate,
} from "@/lib/certificate-templates";

export type PaperFormat = "a4" | "letter";

export const PAPER_DIMENSIONS_MM: Record<PaperFormat, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  letter: { width: 216, height: 279 },
};

export const LETTER_ARTBOARD_SCALE =
  PAPER_DIMENSIONS_MM.letter.height / PAPER_DIMENSIONS_MM.a4.height;

export function getPaperDimensions(format: PaperFormat = "a4") {
  return PAPER_DIMENSIONS_MM[format];
}

export function getPaperLabel(format: PaperFormat = "a4") {
  return format === "letter" ? "US Letter" : "A4";
}

export function normalizePaperFormat(value?: string | null): PaperFormat {
  return value === "letter" ? "letter" : "a4";
}

export function isPaperFormatAvailableForTemplate(
  template: CertificateTemplate,
  paperFormat: PaperFormat,
) {
  return !(template === "classic" && paperFormat === "letter");
}

export function normalizePaperFormatForTemplate(
  templateValue?: string | null,
  paperValue?: string | null,
): PaperFormat {
  const template = normalizeTemplate(templateValue);
  const paperFormat = normalizePaperFormat(paperValue);
  return isPaperFormatAvailableForTemplate(template, paperFormat)
    ? paperFormat
    : "a4";
}
