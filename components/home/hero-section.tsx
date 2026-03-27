"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { LocalizedLink } from "@/components/ui/localized-link";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-800">
            {t("giftBadge")}
          </div>

          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
            {t("titleLine1")}
            <br />
            <span className="text-[var(--brand)]">{t("titleLine2")}</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
            {t("description")}
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5 text-sm text-[var(--brand-dark)]">
            {[t("bullet1"), t("bullet2"), t("bullet3")].map((bullet) => (
              <span
                key={bullet}
                className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5"
              >
                <span className="text-teal-700">•</span>
                {bullet}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LocalizedLink
              href="/purchase?tier=protected"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-7 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)]"
            >
              {t("ctaPrimary")}
            </LocalizedLink>

            <LocalizedLink
              href="#certificate-preview"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-white px-6 py-3.5 text-base font-semibold text-[var(--brand-dark)] transition hover:border-gray-300 hover:bg-gray-50"
            >
              {t("ctaSecondary")}
            </LocalizedLink>
          </div>

          <p className="mt-4 text-sm italic text-[var(--brand)]">
            {t("brandLine")}
          </p>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="p-3">
              <Image
                src="/mascots/finnley-luna-hero.webp"
                alt={t("imageAlt")}
                width={1400}
                height={1100}
                className="h-auto w-full rounded-lg"
                priority
              />
            </div>

            <div className="grid grid-cols-2 gap-px border-t border-[var(--border)] bg-[var(--border)]">
              <div className="bg-white p-4">
                <p className="text-sm font-semibold text-[var(--brand-dark)]">
                  {t("finnleyName")}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {t("finnleyDesc")}
                </p>
              </div>
              <div className="bg-white p-4">
                <p className="text-sm font-semibold text-[var(--brand-dark)]">
                  {t("lunaName")}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
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
