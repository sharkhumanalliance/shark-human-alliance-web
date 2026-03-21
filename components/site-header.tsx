"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const t = useTranslations("header");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Determine if we're on the homepage (with or without locale prefix)
  const isHome = pathname === "/" || /^\/[a-z]{2}\/?$/.test(pathname);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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
      const el = document.querySelector(item.hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      setMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo + brand */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-dark)] text-xs font-semibold text-white">
            SHA
          </div>
          <div className="hidden min-[400px]:block">
            <p className="text-sm font-semibold tracking-wide text-[var(--brand-dark)] whitespace-nowrap">
              {t("brand")}
            </p>
            <p className="text-[11px] text-[var(--muted)] whitespace-nowrap">
              {t("tagline")}
            </p>
          </div>
        </Link>

        {/* Desktop nav — hidden below lg */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) =>
            item.hash ? (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className="text-sm text-[var(--muted)] transition hover:text-[var(--brand-dark)] whitespace-nowrap"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[var(--muted)] transition hover:text-[var(--brand-dark)] whitespace-nowrap"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Right side: language + CTA + hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          <Link
            href="/purchase?tier=protected"
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] whitespace-nowrap"
          >
            {t("cta")}
          </Link>

          {/* Hamburger — visible below lg */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-[var(--brand-dark)] transition hover:bg-gray-100"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="lg:hidden border-t border-[var(--border)] bg-white">
          <nav className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) =>
              item.hash ? (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className="rounded-lg px-3 py-2.5 text-sm text-[var(--muted)] transition hover:bg-gray-50 hover:text-[var(--brand-dark)]"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-[var(--muted)] transition hover:bg-gray-50 hover:text-[var(--brand-dark)]"
                >
                  {item.label}
                </Link>
              )
            )}
            {/* Mobile CTA */}
            <Link
              href="/purchase?tier=protected"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] sm:hidden"
            >
              {t("cta")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
