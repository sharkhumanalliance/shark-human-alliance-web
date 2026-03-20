"use client";

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Google Analytics 4 wrapper.
 * Include <Analytics /> once in the root layout.
 * Renders nothing if NEXT_PUBLIC_GA_MEASUREMENT_ID is not set.
 */
export function Analytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

/**
 * Track a custom event in GA4.
 *
 * Usage:
 *   import { trackEvent } from "@/components/analytics";
 *   trackEvent("purchase_complete", { tier: "nonsnack", value: 29 });
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      "event",
      eventName,
      params
    );
  }
}
