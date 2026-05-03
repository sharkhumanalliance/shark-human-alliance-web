import type { ReactNode } from "react";
import type { PaperFormat } from "@/lib/certificate-paper";

export {
  getPaperDimensions,
  getPaperLabel,
  LETTER_ARTBOARD_SCALE,
  PAPER_DIMENSIONS_MM,
  type PaperFormat,
} from "@/lib/certificate-paper";

type CertificateSheetProps = {
  paperFormat?: PaperFormat;
  children: ReactNode;
  className?: string;
  useNativePaperLayout?: boolean;
};

export function CertificateSheet({
  paperFormat = "a4",
  children,
  className = "",
  useNativePaperLayout = false,
}: CertificateSheetProps) {
  return (
    <div className={`certificate-sheet certificate-sheet--${paperFormat} ${className}`.trim()}>
      {paperFormat === "letter" && !useNativePaperLayout ? (
        <div className="certificate-sheet__scaled">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}
