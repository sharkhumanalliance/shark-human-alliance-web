"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { LocalizedLink } from "@/components/ui/localized-link";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(47,128,237,0.14),transparent_36%),radial-gradient(circle_at_top_right,rgba(249,115,85,0.12),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#ffffff_42%,#f8f9fb_100%)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />

      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:py-20">
        <div className="relative z-10 rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(18,38,56,0.08)] backdrop-blur sm:p-8 lg:p-10">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-sm font-semibold text-orange-800 shadow-sm">
            {t("giftBadge")}
          </div>

          <h1 className="max-w-2xl text-[2.35rem] font-bold leading-[1.02] tracking-tight text-[var(--brand-dark)] sm:text-5xl lg:text-[3.45rem] lg:leading-[1.02]">
            {t("titleLine1")}
            <br />
            <span className="text-[var(--brand)]">{t("titleLine2")}</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
            {t("description")}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5 text-sm text-[var(--brand-dark)]">
            {[t("bullet1"), t("bullet2"), t("bullet3")].map((bullet) => (
              <span
                key={bullet}
                className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-3.5 py-1.5 shadow-sm"
              >
                <span className="text-teal-700">•</span>
                {bullet}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LocalizedLink
              href="/purchase?tier=protected"
              className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-7 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[var(--accent-dark)] sm:w-auto"
            >
              {t("ctaPrimary")}
            </LocalizedLink>

            <LocalizedLink
              href="#certificate-preview"
              className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
            >
              {t("ctaSecondary")}
            </LocalizedLink>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800">
                {t("proofLabel1")}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--brand-dark)]">{t("bullet1")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                {t("proofLabel2")}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--brand-dark)]">{t("bullet2")}</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 sm:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">
                {t("proofLabel3")}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--brand-dark)]">{t("bullet3")}</p>
            </div>
          </div>

          <p className="mt-5 text-sm italic text-[var(--brand)]">
            {t("brandLine")}
          </p>
        </div>

        <div className="relative z-10 lg:pl-2">
          <div className="absolute -left-6 top-10 hidden h-24 w-24 rounded-full bg-sky-100 blur-2xl lg:block" />
          <div className="absolute -right-5 bottom-12 hidden h-28 w-28 rounded-full bg-orange-100 blur-2xl lg:block" />

          <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white p-3 shadow-[0_26px_90px_rgba(18,38,56,0.10)]">
            <Image
              src="/mascots/finnley-luna-hero.webp"
              alt={t("imageAlt")}
              width={1400}
              height={1100}
              className="h-auto w-full rounded-[22px]"
              priority
            />

            <div className="pointer-events-none absolute left-5 top-5 rounded-full border border-white/80 bg-white/88 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-dark)] shadow-sm backdrop-blur">
              {t("imageBadge")}
            </div>

            <div className="mt-3 grid gap-3 min-[420px]:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <p className="text-sm font-semibold text-[var(--brand-dark)]">
                  {t("finnleyName")}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  {t("finnleyDesc")}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <p className="text-sm font-semibold text-[var(--brand-dark)]">
                  {t("lunaName")}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  {t("lunaDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
