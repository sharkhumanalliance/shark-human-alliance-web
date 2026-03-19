"use client";

import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-sky-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-dark)] text-sm font-semibold text-white shadow-lg shadow-sky-200/60">
                SHA
              </div>
              <p className="text-sm font-semibold text-[var(--brand-dark)]">
                {t("brand")}
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {t("tagline")}
            </p>
            <p className="mt-3 text-xs text-[var(--muted)]">
              {t("madeWith")}
            </p>
            <a
              href={`mailto:${t("email")}`}
              className="mt-2 inline-block text-xs text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
            >
              {t("email")}
            </a>
          </div>

          {/* Our Story */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-dark)]">
              {t("aboutTitle")}
            </h4>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {t("aboutText")}
            </p>
          </div>

          {/* Transparency */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-dark)]">
              {t("transparencyTitle")}
            </h4>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {t("transparencyText")}
            </p>
          </div>

          {/* Legal + Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-dark)]">
              {t("legalTitle")}
            </h4>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {t("legalText")}
            </p>
            <nav className="mt-4 flex flex-col gap-2 text-sm">
              <a href="/#membership" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">
                {t("nav.membership")}
              </a>
              <a href="/#real-impact" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">
                {t("nav.about")}
              </a>
              <a href="/impact" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">
                {t("nav.impact")}
              </a>
              <a href="/faq" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">
                {t("nav.faq")}
              </a>
              <a href="/registry" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">
                {t("nav.registry")}
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t border-sky-100 pt-5 text-center text-xs text-[var(--muted)]">
          {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
