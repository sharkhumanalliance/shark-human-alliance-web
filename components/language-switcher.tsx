"use client";

import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
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

  return (
    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
      {locales.map((loc) => (
        <Link
          key={loc.code}
          href={`${buildLocalizedPath(loc.code, pathname || "/")}${search ? `?${search}` : ""}`}
          lang={loc.code}
          hrefLang={loc.code}
          title={loc.label}
          aria-label={loc.label}
          aria-current={locale === loc.code ? "page" : undefined}
          translate="no"
          className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold tracking-[0.18em] transition sm:h-11 sm:w-11 ${
            locale === loc.code
              ? "bg-sky-100 shadow-sm"
              : "opacity-65 hover:opacity-100 hover:bg-sky-50"
          }`}
        >
          {loc.shortLabel}
        </Link>
      ))}
    </div>
  );
}
