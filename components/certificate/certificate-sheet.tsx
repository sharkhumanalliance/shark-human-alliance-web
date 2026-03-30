import type { ReactNode } from "react";

export type PaperFormat = "a4" | "letter";

export const PAPER_DIMENSIONS_MM: Record<PaperFormat, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  letter: { width: 216, height: 279 },
};

export const LETTER_ARTBOARD_SCALE = PAPER_DIMENSIONS_MM.letter.height / PAPER_DIMENSIONS_MM.a4.height;

export function getPaperDimensions(format: PaperFormat = "a4") {
  return PAPER_DIMENSIONS_MM[format];
}

export function getPaperLabel(format: PaperFormat = "a4") {
  return format === "letter" ? "US Letter" : "A4";
}

type CertificateSheetProps = {
  paperFormat?: PaperFormat;
  children: ReactNode;
  className?: string;
};

export function CertificateSheet({
  paperFormat = "a4",
  children,
  className = "",
}: CertificateSheetProps) {
  return (
    <div className={`certificate-sheet certificate-sheet--${paperFormat} ${className}`.trim()}>
      {paperFormat === "letter" ? (
        <div className="certificate-sheet__scaled">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}
