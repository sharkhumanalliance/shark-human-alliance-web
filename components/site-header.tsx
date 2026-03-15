"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const t = useTranslations("header");

  const navItems = [
    { label: t("nav.realImpact"), href: "/#real-impact" },
    { label: t("nav.howItWorks"), href: "/#how-it-works" },
    { label: t("nav.membership"), href: "/membership" },
    { label: t("nav.about"), href: "/#about" },
    { label: t("nav.registry"), href: "/registry" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur">
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
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--brand-dark)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/membership"
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </header>
  );
}
