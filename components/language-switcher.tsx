"use client";

import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buildLocalizedPath } from "@/lib/navigation";

const locales = [
  { code: "en", shortLabel: "EN", label: "English" },
  { code: "es", shortLabel: "ES", label: "Espa\u00f1ol" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [open, setOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const currentLocale = locales.find((loc) => loc.code === locale) ?? locales[0];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!switcherRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={switcherRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Language: ${currentLocale.label}`}
        translate="no"
        className="inline-flex h-10 min-w-[3.25rem] items-center justify-center gap-1 rounded-full bg-[var(--surface-soft)] px-3 text-xs font-semibold tracking-[0.18em] text-[var(--brand-dark)] shadow-sm transition hover:bg-white sm:h-11"
      >
        <span>{currentLocale.shortLabel}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-36 overflow-hidden rounded-xl border border-[var(--border)] bg-white py-1 shadow-lg"
        >
          {locales.map((loc) => {
            const isCurrent = locale === loc.code;

            return (
              <Link
                key={loc.code}
                href={`${buildLocalizedPath(loc.code, pathname || "/")}${search ? `?${search}` : ""}`}
                lang={loc.code}
                hrefLang={loc.code}
                title={loc.label}
                aria-label={loc.label}
                aria-current={isCurrent ? "page" : undefined}
                role="menuitem"
                translate="no"
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm font-semibold transition ${
                  isCurrent
                    ? "bg-[var(--surface-soft)] text-[var(--brand-dark)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--brand-dark)]"
                }`}
              >
                <span>{loc.label}</span>
                <span className="text-xs font-semibold tracking-[0.14em]">
                  {loc.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
