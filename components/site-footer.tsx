"use client";

import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-white/60 bg-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--brand-dark)]">
            {t("brand")}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {t("tagline")}
          </p>
        </div>

        <div className="flex flex-wrap gap-5 text-sm text-[var(--muted)]">
          <a href="/#real-impact" className="transition hover:text-[var(--brand-dark)]">
            {t("nav.realImpact")}
          </a>
          <a href="/#about" className="transition hover:text-[var(--brand-dark)]">
            {t("nav.about")}
          </a>
          <a href="/membership" className="transition hover:text-[var(--brand-dark)]">
            {t("nav.membership")}
          </a>
          <a href="/#faq" className="transition hover:text-[var(--brand-dark)]">
            {t("nav.faq")}
          </a>
        </div>
      </div>
    </footer>
  );
}
