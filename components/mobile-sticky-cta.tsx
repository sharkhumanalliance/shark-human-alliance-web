"use client";

import { useTranslations } from "next-intl";

export function MobileStickyCta() {
  const t = useTranslations("mobileCta");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-sky-200 bg-white/95 p-3 backdrop-blur-md md:hidden">
      <a
        href="/purchase?tier=protected"
        className="flex w-full items-center justify-center gap-3 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[var(--accent-dark)]"
      >
        <span>{t("label")}</span>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[var(--accent-dark)]">
          {t("price")}
        </span>
      </a>
    </div>
  );
}
