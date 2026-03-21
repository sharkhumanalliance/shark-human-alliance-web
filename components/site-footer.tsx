"use client";

import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-soft)]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          {/* Brand + about */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-dark)] text-xs font-semibold text-white">
                SHA
              </div>
              <p className="text-sm font-semibold text-[var(--brand-dark)]">
                {t("brand")}
              </p>
            </div>
            <p className="mt-2 max-w-sm text-xs leading-5 text-[var(--muted)]">
              {t("tagline")}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {t("madeWith")}
            </p>
            <a
              href={`mailto:${t("email")}`}
              className="mt-1 inline-block text-xs text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
            >
              {t("email")}
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-dark)]">
              {t("navTitle")}
            </h4>
            <nav className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <a href="/#membership" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">
                {t("nav.membership")}
              </a>
              <a href="/registry" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">
                {t("nav.registry")}
              </a>
              <a href="/#real-impact" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">
                {t("nav.about")}
              </a>
              <a href="/wanted" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">
                {t("nav.wanted")}
              </a>
              <a href="/impact" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">
                {t("nav.impact")}
              </a>
              <a href="/career" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">
                {t("nav.career")}
              </a>
              <a href="/faq" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">
                {t("nav.faq")}
              </a>
            </nav>
          </div>

          {/* Legal + Transparency */}
          <div className="space-y-3">
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-dark)]">
                {t("legalTitle")}
              </h4>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                {t("legalText")}
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-dark)]">
                {t("transparencyTitle")}
              </h4>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                {t("transparencyText")}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 border-t border-[var(--border)] pt-4 flex flex-col items-center gap-1 text-center text-[10px] text-[var(--muted)]">
          <p>{t("copyright")}</p>
          <p>{t("operator")}</p>
        </div>
      </div>
    </footer>
  );
}
