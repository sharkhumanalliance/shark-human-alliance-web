"use client";

import { LocalizedLink } from "@/components/ui/localized-link";
import { useTranslations } from "next-intl";

export function VerifySampleContent() {
  const t = useTranslations("verifySample");

  return (
    <section className="mx-auto max-w-xl px-5 py-16 md:py-24">
      {/* Badge */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d97706"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-sm font-bold uppercase tracking-wider text-amber-600">
          {t("badge")}
        </span>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-amber-200 bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-[var(--brand-dark)]">
          {t("title")}
        </h1>

        <p className="mb-6 text-center text-sm leading-relaxed text-[var(--muted)]">
          {t("description")}
        </p>

        <div className="rounded-xl bg-amber-50 p-5">
          <p className="text-center text-sm leading-relaxed text-amber-800">
            {t("quip")}
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-6 space-y-3">
          <LocalizedLink
            href="/purchase?tier=protected"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-4 text-base font-bold text-white transition hover:bg-[var(--accent-dark)]"
          >
            🛡️ {t("buyCta")}
          </LocalizedLink>
          <LocalizedLink
            href="/purchase?tier=protected&gift=true"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-6 py-4 text-base font-bold text-[var(--brand-dark)] transition hover:border-[var(--accent)] hover:bg-orange-50"
          >
            🎁 {t("giftCta")}
          </LocalizedLink>
          <LocalizedLink
            href="/wanted"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-4 text-base font-bold text-red-700 transition hover:bg-red-50"
          >
            🚨 {t("wantedCta")}
          </LocalizedLink>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mx-auto mt-6 max-w-md text-center text-xs leading-relaxed text-[var(--muted)]">
        {t("disclaimer")}
      </p>

      {/* Secondary links */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <LocalizedLink
          href="/registry"
          className="text-sm font-medium text-[var(--brand)] transition-colors hover:underline"
        >
          {t("registryLink")}
        </LocalizedLink>
      </div>
    </section>
  );
}
