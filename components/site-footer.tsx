"use client";

import { useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";
import { openCookieSettings } from "@/components/cookies/cookie-consent";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-dark)] text-xs font-semibold text-white">
                SHA
              </div>
              <p className="text-sm font-semibold text-[var(--brand-dark)]">{t("brand")}</p>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-5 text-[var(--muted)]">{t("aboutText")}</p>
            <div className="mt-3 flex items-center gap-3">
              <a href="https://www.facebook.com/Sharkhumanalliance/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-[var(--muted)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)] hover:text-[var(--brand-dark)]">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://instagram.com/sharkhumanalliance" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-[var(--muted)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)] hover:text-[var(--brand-dark)]">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href={`mailto:${t("email")}`} aria-label="Email" className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-[var(--muted)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)] hover:text-[var(--brand-dark)]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-dark)]">{t("navTitle")}</h4>
            <nav className="mt-2 flex flex-col gap-1.5 text-xs">
              <LocalizedLink href="/membership" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">{t("nav.membership")}</LocalizedLink>
              <LocalizedLink href="/impact" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">{t("nav.impact")}</LocalizedLink>
              <LocalizedLink href="/faq" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">{t("nav.faq")}</LocalizedLink>
              <LocalizedLink href="/registry" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">{t("nav.registry")}</LocalizedLink>
              <LocalizedLink href="/wanted" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">{t("nav.wanted")}</LocalizedLink>
              <LocalizedLink href="/career" className="text-[var(--muted)] transition hover:text-[var(--brand-dark)]">{t("nav.career")}</LocalizedLink>
            </nav>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-dark)]">{t("legalTitle")}</h4>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{t("legalText")}</p>
            <div className="mt-3 flex flex-col items-start gap-2 text-xs">
              <LocalizedLink href="/terms" className="text-[var(--muted)] transition-colors duration-300 ease-out hover:text-[var(--brand-dark)]">
                {t("termsLink")}
              </LocalizedLink>
              <LocalizedLink href="/cookie-policy" className="text-[var(--muted)] transition-colors duration-300 ease-out hover:text-[var(--brand-dark)]">
                {t("cookiePolicyLink")}
              </LocalizedLink>
              <button
                type="button"
                onClick={() => openCookieSettings()}
                className="text-left text-[var(--muted)] transition-colors duration-300 ease-out hover:text-[var(--brand-dark)]"
              >
                {t("cookieSettingsLink")}
              </button>
              <a
                href={`mailto:${t("email")}`}
                className="text-[var(--muted)] transition-colors duration-300 ease-out hover:text-[var(--brand-dark)]"
              >
                {t("supportLink")}
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-dark)]">{t("transparencyTitle")}</h4>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{t("transparencyText")}</p>
            <p className="mt-3 text-xs text-[var(--muted)]">
              {t("madeWith")}{" "}
              <span className="text-red-500">&#10084;</span>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5 text-[11px] text-[var(--muted)]">
          <p>&copy; {new Date().getFullYear()} {t("brand")}.</p>
          <p>{t("operator")}</p>
        </div>
      </div>
    </footer>
  );
}