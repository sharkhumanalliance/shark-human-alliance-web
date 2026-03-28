"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { LocalizedLink } from "@/components/ui/localized-link";

export function HeroSection() {
  const t = useTranslations("hero");
  const bullets = [t("bullet1"), t("bullet2"), t("bullet3")];

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:py-14">
        <div className="flex max-w-xl flex-col justify-center lg:pr-3">
          <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-800 sm:text-sm">
            {t("giftBadge")}
          </div>

          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
            {t("titleLine1")}
            <br />
            <span className="text-[var(--brand)]">{t("titleLine2")}</span>
          </h1>

          <p className="mt-3 max-w-lg text-lg font-semibold leading-7 text-[var(--brand-dark)] sm:text-[1.15rem]">
            {t("brandLine")}
          </p>

          <p className="mt-3 max-w-lg text-[0.98rem] leading-7 text-[var(--muted)] sm:text-[1.03rem] sm:leading-7">
            {t("description")}
          </p>

          <ul className="mt-5 flex flex-col gap-2.5 text-sm font-medium leading-6 text-[var(--brand-dark)] sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2.5">
            {bullets.map((bullet) => (
              <li key={bullet} className="inline-flex items-start gap-2">
                <span className="mt-[0.22rem] text-[var(--brand)]" aria-hidden="true">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <LocalizedLink
              href="/purchase?tier=protected"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-[var(--accent)] px-7 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)]"
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
        </div>

        <div className="relative lg:pl-2">
          <div className="relative overflow-hidden rounded-[22px] border border-[var(--border)] bg-white shadow-[0_18px_54px_rgba(18,38,56,0.12)]">
            <div className="p-2.5 sm:p-3">
              <Image
                src="/mascots/finnley-luna-hero.webp"
                alt={t("imageAlt")}
                width={1400}
                height={1100}
                className="h-auto w-full rounded-[18px] bg-[var(--surface-soft)]"
                priority
              />
            </div>

            <div className="grid grid-cols-2 gap-px border-t border-[var(--border)] bg-[var(--border)]">
              <div className="bg-white p-3 sm:p-4">
                <p className="text-sm font-semibold text-[var(--brand-dark)]">
                  {t("finnleyName")}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  {t("finnleyDesc")}
                </p>
              </div>
              <div className="bg-white p-3 sm:p-4">
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
