"use client";

import { useI18n } from "@/components/i18n-provider";
import { type Locale, localeNames } from "@/data/i18n";

const locales: Locale[] = ["en", "es", "zh"];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-full border border-sky-200 bg-white/80 px-1 py-1 text-xs font-medium">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className={`rounded-full px-3 py-1.5 transition ${
            locale === loc
              ? "bg-[var(--brand-dark)] text-white shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--brand-dark)]"
          }`}
        >
          {localeNames[loc]}
        </button>
      ))}
    </div>
  );
}
