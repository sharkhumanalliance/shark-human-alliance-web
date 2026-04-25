/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  buildConsent,
  COOKIE_CONSENT_UPDATED_EVENT,
  readConsent,
  writeConsent,
} from "@/lib/cookie-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const OPEN_SETTINGS_EVENT = "sha:open-cookie-settings";

function updateGoogleConsent(analytics: boolean) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT));
}

export function CookieConsent() {
  const t = useTranslations("cookies");
  const [hydrated, setHydrated] = useState(false);
  const [cookieVersion, setCookieVersion] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      updateGoogleConsent(existing.analytics);
    }
    setHydrated(true);

    const onOpen = () => {
      const current = readConsent();
      setAnalyticsEnabled(current?.analytics ?? false);
      setIsModalOpen(true);
    };

    window.addEventListener(OPEN_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, onOpen);
  }, []);

  if (!hydrated) return null;

  const consent = readConsent();
  const shouldShowBanner = !consent;

  const applyConsent = (analytics: boolean) => {
    const nextConsent = buildConsent(analytics);
    writeConsent(nextConsent);
    updateGoogleConsent(analytics);
    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, {
        detail: nextConsent,
      }),
    );
    setCookieVersion((current) => current + 1);
    setAnalyticsEnabled(analytics);
    setIsModalOpen(false);
  };

  const openSettings = () => {
    setAnalyticsEnabled(consent?.analytics ?? false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="hidden" aria-hidden="true">{cookieVersion}</div>
      {shouldShowBanner ? (
        <div className="fixed inset-x-4 bottom-4 z-[110] mx-auto max-w-3xl rounded-3xl border border-[var(--border)] bg-white/95 p-4 shadow-[0_24px_80px_rgba(10,30,54,0.18)] backdrop-blur sm:bottom-6 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--section-label)]">
                {t("eyebrow")}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[var(--brand-dark)] sm:text-xl">
                {t("title")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                {t("description")}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:min-w-[220px]">
              <button
                type="button"
                onClick={() => applyConsent(true)}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
              >
                {t("acceptAnalytics")}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => applyConsent(false)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-dark)] transition hover:bg-[var(--surface-soft)]"
                >
                  {t("necessaryOnly")}
                </button>
                <button
                  type="button"
                  onClick={openSettings}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-dark)] transition hover:bg-[var(--surface-soft)]"
                >
                  {t("settings")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[rgba(10,30,54,0.42)] p-4 sm:items-center">
          <div className="w-full max-w-2xl rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_32px_100px_rgba(10,30,54,0.22)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--section-label)]">
                  {t("eyebrow")}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--brand-dark)]">
                  {t("settingsTitle")}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  {t("settingsDescription")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--brand-dark)] transition hover:bg-[var(--surface-soft)]"
                aria-label={t("close")}
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--brand-dark)]">
                      {t("necessary.title")}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      {t("necessary.description")}
                    </p>
                  </div>
                  <span className="inline-flex min-h-[36px] items-center rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-dark)]">
                    {t("alwaysActive")}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-white p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--brand-dark)]">
                      {t("analytics.title")}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      {t("analytics.description")}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analyticsEnabled}
                    onClick={() => setAnalyticsEnabled((current) => !current)}
                    className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition ${analyticsEnabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                  >
                    <span
                      className={`absolute left-1 inline-block h-6 w-6 rounded-full bg-white shadow-sm transition ${analyticsEnabled ? "translate-x-6" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => applyConsent(false)}
                className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-medium text-[var(--brand-dark)] transition hover:bg-[var(--surface-soft)]"
              >
                {t("necessaryOnly")}
              </button>
              <button
                type="button"
                onClick={() => applyConsent(analyticsEnabled)}
                className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--border)] bg-[var(--brand-dark)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-navy)]"
              >
                {t("saveSettings")}
              </button>
              <button
                type="button"
                onClick={() => applyConsent(true)}
                className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
              >
                {t("acceptAll")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
