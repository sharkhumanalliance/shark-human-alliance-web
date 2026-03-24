"use client";

import { useRef, useState, useEffect } from "react";
import {
  CertificateDocument,
  type CertificateDocumentProps,
} from "./certificate-document";

/**
 * Preview wrapper that scales the 210 mm × 297 mm certificate artboard
 * into the available container width using CSS transform.
 */

const PAPER_WIDTH_PX = 794; // 210 mm at 96 dpi

export function CertificatePreview(
  props: Omit<CertificateDocumentProps, "className" | "priorityImages">
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      setScale(el.clientWidth / PAPER_WIDTH_PX);
    }

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="certificate-preview-shell">
      <div className="certificate-preview-inner" ref={containerRef}>
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
            <CertificateDocument {...props} />
          </div>
        )}
      </div>
    </div>
  );
}

export { type CertificateDocumentProps, type CertificateTemplate } from "./certificate-document";
