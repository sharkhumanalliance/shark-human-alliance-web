"use client";

import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  readConsent,
} from "@/lib/cookie-consent";

const RAW_GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function normalizeGaMeasurementId(id?: string) {
  const trimmed = id?.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith("G-") ? trimmed : `G-${trimmed}`;
}

const GA_ID = normalizeGaMeasurementId(RAW_GA_ID);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | AnalyticsParamValue[]
  | { [key: string]: AnalyticsParamValue };

export type AnalyticsParams = Record<string, AnalyticsParamValue>;

function updateGoogleConsent(analytics: boolean) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

/**
 * Google Analytics 4 wrapper.
 * Include <Analytics /> once in the root layout.
 * Renders nothing only if NEXT_PUBLIC_GA_MEASUREMENT_ID is not set.
 */
export function Analytics() {
  const analyticsEnabled = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, onStoreChange);
      return () =>
        window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, onStoreChange);
    },
    () => readConsent()?.analytics ?? false,
    () => false,
  );

  useEffect(() => {
    updateGoogleConsent(analyticsEnabled);
  }, [analyticsEnabled]);

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
          window.gtag = function gtag(){window.dataLayer.push(arguments);};
          window.gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500,
          });
          window.gtag('js', new Date());
          window.gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
          });
        `}
      </Script>
    </>
  );
}

export function trackEvent(
  action: string,
  params?: AnalyticsParams,
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", action, params);
}

export async function getAnalyticsClientContext(): Promise<{
  analyticsConsent: boolean;
  gaClientId?: string;
}> {
  if (typeof window === "undefined") return { analyticsConsent: false };

  const analyticsConsent = readConsent()?.analytics === true;
  const gtag = window.gtag;
  if (!analyticsConsent || !GA_ID || typeof gtag !== "function") {
    return { analyticsConsent };
  }

  return new Promise((resolve) => {
    let resolved = false;
    const timeoutRef: { current?: number } = {};
    const finish = (gaClientId?: string) => {
      if (resolved) return;
      resolved = true;
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
      }
      resolve({ analyticsConsent, gaClientId });
    };

    timeoutRef.current = window.setTimeout(() => finish(), 350);

    try {
      gtag("get", GA_ID, "client_id", (clientId: unknown) => {
        finish(typeof clientId === "string" ? clientId : undefined);
      });
    } catch {
      finish();
    }
  });
}
