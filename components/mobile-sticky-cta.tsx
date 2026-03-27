"use client";

import { useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";

export function MobileStickyCta() {
  const t = useTranslations("mobileCta");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:hidden">
      <div className="mx-auto max-w-md rounded-[20px] border border-white/70 bg-white/96 p-2 shadow-[0_-14px_36px_rgba(18,38,56,0.16)] backdrop-blur-md">
        <p className="px-2 pb-2 text-center text-[11px] font-medium tracking-[0.01em] text-[var(--muted)]">
          {t("note")}
        </p>
        <LocalizedLink
          href="/purchase?tier=protected"
          className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
        >
          <span>{t("label")}</span>
          <span className="rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-[var(--accent-dark)] shadow-sm">
            {t("price")}
          </span>
        </LocalizedLink>
      </div>
    </div>
  );
}
