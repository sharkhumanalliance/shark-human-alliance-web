"use client";

import { useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";

export function NotFoundContent() {
  const t = useTranslations("notFound");

  return (
    <section data-reveal className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 md:py-24">
      <div className="rounded-[28px] border border-[var(--border)] bg-white px-5 py-8 shadow-sm sm:px-8 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          {t("text")}
        </p>
        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <LocalizedLink
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
          >
            {t("homeCta")}
          </LocalizedLink>
          <LocalizedLink
            href="/registry"
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--brand-dark)] transition-colors hover:bg-[var(--surface-soft)]"
          >
            {t("registryCta")}
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
