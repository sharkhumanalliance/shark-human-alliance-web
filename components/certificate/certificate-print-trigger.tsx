"use client";

import { useEffect } from "react";

type CertificatePrintTriggerProps = {
  enabled?: boolean;
};

export function CertificatePrintTrigger({
  enabled = false,
}: CertificatePrintTriggerProps) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function triggerPrint() {
      if (typeof document !== "undefined" && "fonts" in document) {
        try {
          await document.fonts.ready;
        } catch {
          // Ignore font readiness issues and continue with best effort printing.
        }
      }

      if (document.readyState !== "complete") {
        await new Promise<void>((resolve) => {
          window.addEventListener("load", () => resolve(), { once: true });
        });
      }

      await new Promise((resolve) => window.setTimeout(resolve, 350));

      if (!cancelled) {
        window.print();
      }
    }

    triggerPrint();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return null;
}
