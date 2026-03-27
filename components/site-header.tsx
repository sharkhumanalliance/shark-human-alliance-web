"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LocalizedLink } from "@/components/ui/localized-link";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const t = useTranslations("header");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/" || /^\/[a-z]{2}\/?$/.test(pathname);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navItems = [
    { label: t("nav.membership"), hash: "#membership", href: "/#membership" },
    { label: t("nav.about"), hash: "#real-impact", href: "/#real-impact" },
    { label: t("nav.impact"), hash: "", href: "/impact" },
    { label: t("nav.faq"), hash: "", href: "/faq" },
    { label: t("nav.registry"), hash: "", href: "/registry" },
  ];

  function handleNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof navItems)[0]
  ) {
    if (item.hash && isHome) {
      e.preventDefault();
      setMenuOpen(false);
      document.querySelector(item.hash)?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3">
        <LocalizedLink href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-dark)] text-xs font-semibold text-white shadow-sm">
            SHA
          </div>
          <div className="hidden min-[400px]:block">
            <p className="whitespace-nowrap text-sm font-semibold tracking-wide text-[var(--brand-dark)]">
              {t("brand")}
            </p>
            <p className="whitespace-nowrap text-[11px] text-[var(--muted)]">
              {t("tagline")}
            </p>
          </div>
        </LocalizedLink>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) =>
            item.hash ? (
              <LocalizedLink
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e as React.MouseEvent<HTMLAnchorElement>, item)}
                className="whitespace-nowrap text-sm text-[var(--muted)] transition hover:text-[var(--brand-dark)]"
              >
                {item.label}
              </LocalizedLink>
            ) : (
              <LocalizedLink
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-sm text-[var(--muted)] transition hover:text-[var(--brand-dark)]"
              >
                {item.label}
              </LocalizedLink>
            )
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <LocalizedLink
            href="/purchase?tier=protected"
            className="hidden whitespace-nowrap rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] sm:inline-flex"
          >
            {t("cta")}
          </LocalizedLink>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--brand-dark)] transition hover:bg-gray-100 lg:hidden"
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

      {menuOpen && (
        <div className="border-t border-[var(--border)] bg-white/95 backdrop-blur lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navItems.map((item) =>
              item.hash ? (
                <LocalizedLink
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e as React.MouseEvent<HTMLAnchorElement>, item)}
                  className="rounded-xl px-3 py-3 text-sm text-[var(--muted)] transition hover:bg-gray-50 hover:text-[var(--brand-dark)]"
                >
                  {item.label}
                </LocalizedLink>
              ) : (
                <LocalizedLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm text-[var(--muted)] transition hover:bg-gray-50 hover:text-[var(--brand-dark)]"
                >
                  {item.label}
                </LocalizedLink>
              )
            )}
            <LocalizedLink
              href="/purchase?tier=protected"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] sm:hidden"
            >
              {t("cta")}
            </LocalizedLink>
          </nav>
        </div>
      )}
    </header>
  );
}
