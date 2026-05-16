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
  maxMobileViewportHeightRatio?: number;
};

export function CertificatePreview(props: CertificatePreviewProps) {
  const { maxMobileViewportHeightRatio, ...documentProps } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const paperFormat = documentProps.paperFormat || "a4";
  const template = normalizeTemplate(documentProps.template);
  const publicTier = getPublicTierKey(documentProps.tier);
  const useNativePaperLayout =
    paperFormat === "letter" &&
    (template === "playful" ||
      (template === "luxury" &&
        (publicTier === "protected" ||
          publicTier === "nonsnack" ||
          publicTier === "business")));
  const paper = getPaperDimensions(paperFormat);
  const paperWidthPx = paper.width * MM_TO_PX;
  const paperHeightPx = paper.height * MM_TO_PX;
  const aspectRatio = (paper.height / paper.width) * 100;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      const widthScale = el.clientWidth / paperWidthPx;
      const mobileHeightScale =
        maxMobileViewportHeightRatio && window.innerWidth < 640
          ? (window.innerHeight * maxMobileViewportHeightRatio) / paperHeightPx
          : Number.POSITIVE_INFINITY;
      setScale(Math.min(widthScale, mobileHeightScale));
    }

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [maxMobileViewportHeightRatio, paperHeightPx, paperWidthPx]);

  return (
    <div className="certificate-preview-shell">
      <div
        className="certificate-preview-inner"
        ref={containerRef}
        style={
          scale > 0
            ? { height: `${paperHeightPx * scale}px` }
            : { paddingTop: `${aspectRatio}%` }
        }
      >
        {scale > 0 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: `translateX(-50%) scale(${scale})`,
              transformOrigin: "top center",
            }}
          >
            <CertificateSheet
              paperFormat={paperFormat}
              useNativePaperLayout={useNativePaperLayout}
            >
              <CertificateDocument {...documentProps} paperFormat={paperFormat} />
            </CertificateSheet>
          </div>
        )}
      </div>
    </div>
  );
}

export { type CertificateDocumentProps, type CertificateTemplate } from "./certificate-document";
export { type PaperFormat } from "./certificate-sheet";
