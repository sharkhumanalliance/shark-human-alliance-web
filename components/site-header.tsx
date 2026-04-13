"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LocalizedLink } from "@/components/ui/localized-link";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const t = useTranslations("header");
  const [menuOpen, setMenuOpen] = useState(false);


  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { label: t("nav.membership"), href: "/membership" },
    { label: t("nav.impact"), href: "/impact" },
    { label: t("nav.registry"), href: "/registry" },
    { label: t("nav.faq"), href: "/faq" },
  ];

  return (
    <header className="sticky top-0 z-50 overflow-x-clip border-b border-[var(--border)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 items-center justify-between px-4 py-3 sm:px-6 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-8 lg:justify-normal">
        <LocalizedLink href="/" onClick={() => setMenuOpen(false)} className="flex min-w-0 shrink items-center gap-3 lg:justify-self-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-dark)] text-xs font-semibold text-white">
            SHA
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-wide text-[var(--brand-dark)] sm:whitespace-nowrap">
              {t("brand")}
            </p>
            <p className="hidden text-[11px] text-[var(--muted)] sm:block sm:whitespace-nowrap">
              {t("tagline")}
            </p>
          </div>
        </LocalizedLink>

        <nav className="hidden items-center justify-start gap-6 lg:flex lg:pl-2">
          {navItems.map((item) => (
            <LocalizedLink
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-sm text-[var(--muted)] transition hover:text-[var(--brand-dark)]"
            >
              {item.label}
            </LocalizedLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5 lg:justify-self-end">
          <LanguageSwitcher />
          <LocalizedLink
            href="/purchase?tier=protected"
            className="hidden min-h-11 whitespace-nowrap rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:inline-flex sm:min-h-10"
          >
            {t("cta")}
          </LocalizedLink>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 top-[73px] z-40 bg-slate-900/20 backdrop-blur-[1px] lg:hidden"
        />
      ) : null}

      <div
        className={`relative z-50 grid bg-white transition-[grid-template-rows] duration-300 ease-in-out lg:hidden ${menuOpen ? "grid-rows-[1fr] border-t border-[var(--border)] shadow-lg" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            <LocalizedLink
              href="/purchase?tier=protected"
              onClick={() => setMenuOpen(false)}
              className="mb-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3.5 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)]"
            >
              {t("cta")}
            </LocalizedLink>
            {navItems.map((item) => (
              <LocalizedLink
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm text-[var(--muted)] transition-colors duration-300 ease-out hover:bg-gray-50 hover:text-[var(--brand-dark)]"
              >
                {item.label}
              </LocalizedLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
