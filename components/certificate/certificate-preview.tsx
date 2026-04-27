"use client";

import { useRef, useState, useEffect } from "react";
import {
  CertificateDocument,
  normalizeTemplate,
  type CertificateDocumentProps,
} from "./certificate-document";
import {
  CertificateSheet,
  getPaperDimensions,
  type PaperFormat,
} from "./certificate-sheet";
import { getPublicTierKey } from "@/lib/tiers";

/**
 * Preview wrapper that scales the 210 mm × 297 mm certificate artboard
 * into the available container width using CSS transform.
 */

const MM_TO_PX = 96 / 25.4;

type CertificatePreviewProps = Omit<CertificateDocumentProps, "className" | "priorityImages"> & {
  paperFormat?: PaperFormat;
};

export function CertificatePreview(props: CertificatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const paperFormat = props.paperFormat || "a4";
  const template = normalizeTemplate(props.template);
  const publicTier = getPublicTierKey(props.tier);
  const useNativePaperLayout =
    paperFormat === "letter" &&
    (template === "playful" || (template === "luxury" && publicTier === "protected"));
  const paper = getPaperDimensions(paperFormat);
  const paperWidthPx = paper.width * MM_TO_PX;
  const aspectRatio = (paper.height / paper.width) * 100;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      setScale(el.clientWidth / paperWidthPx);
    }

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [paperWidthPx]);

  return (
    <div className="certificate-preview-shell">
      <div className="certificate-preview-inner" ref={containerRef} style={{ paddingTop: `${aspectRatio}%` }}>
        {scale > 0 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <CertificateSheet
              paperFormat={paperFormat}
              useNativePaperLayout={useNativePaperLayout}
            >
              <CertificateDocument {...props} paperFormat={paperFormat} />
            </CertificateSheet>
          </div>
        )}
      </div>
    </div>
  );
}

export { type CertificateDocumentProps, type CertificateTemplate } from "./certificate-document";
export { type PaperFormat } from "./certificate-sheet";
