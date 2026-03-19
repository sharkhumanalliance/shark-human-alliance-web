"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const t = useTranslations("header");
  const pathname = usePathname();

  // Determine if we're on the homepage (with or without locale prefix)
  const isHome = pathname === "/" || /^\/[a-z]{2}\/?$/.test(pathname);

  const navItems = [
    { label: t("nav.membership"), hash: "#membership", href: "/#membership" },
    { label: t("nav.about"), hash: "#real-impact", href: "/#real-impact" },
    { label: t("nav.impact"), hash: "", href: "/impact" },
    { label: t("nav.faq"), hash: "", href: "/faq" },
    { label: t("nav.registry"), hash: "", href: "/registry" },
  ];

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) {
    if (item.hash && isHome) {
      e.preventDefault();
      const el = document.querySelector(item.hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-dark)] text-sm font-semibold text-white shadow-lg shadow-sky-200/60">
            SHA
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-[var(--brand-dark)]">
              {t("brand")}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {t("tagline")}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) =>
            item.hash ? (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--brand-dark)]"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--brand-dark)]"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/purchase?tier=protected"
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </header>
  );
}
