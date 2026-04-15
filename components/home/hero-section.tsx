"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { LocalizedLink } from "@/components/ui/localized-link";

export function HeroSection() {
  const t = useTranslations("hero");
  const bullets = [t("bullet1"), t("bullet2"), t("bullet3")];

  const heroActions = (
    <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-3">
      <LocalizedLink
        href="/purchase?tier=protected"
        className="inline-flex min-h-[48px] w-full items-center justify-center whitespace-nowrap rounded-lg bg-[var(--accent)] px-7 py-3.5 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)]"
      >
        {t("ctaPrimary")}
      </LocalizedLink>

      <LocalizedLink
        href="#certificate-preview"
        className="inline-flex min-h-[48px] w-full items-center justify-center whitespace-nowrap rounded-lg border border-[var(--border)] bg-white/88 px-6 py-3.5 text-base font-semibold text-[var(--brand-dark)] backdrop-blur transition-colors duration-300 ease-out hover:bg-white"
      >
        {t("ctaSecondary")}
      </LocalizedLink>
    </div>
  );

  const heroBullets = (
    <ul className="overflow-hidden rounded-[22px] border border-white/70 bg-white/66 text-sm font-medium leading-6 text-[var(--brand-dark)] shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur sm:grid sm:grid-cols-3 sm:divide-x sm:divide-[var(--border)]">
      {bullets.map((bullet) => (
        <li
          key={bullet}
          className="border-b border-[var(--border)] px-4 py-3.5 last:border-b-0 sm:border-b-0 sm:px-5"
        >
          {bullet}
        </li>
      ))}
    </ul>
  );

  return (
    <section className="relative overflow-hidden bg-[var(--surface-soft)]">
      <div className="absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top_left,rgba(125,181,230,0.18),transparent_42%),radial-gradient(circle_at_top_right,rgba(238,138,69,0.12),transparent_34%),linear-gradient(180deg,#f7fbff_0%,rgba(248,250,252,0.94)_58%,rgba(248,250,252,1)_100%)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-16">
        <div className="relative z-10 flex max-w-xl flex-col justify-center lg:pr-2">
          <div className="mb-4 inline-flex w-fit max-w-full items-center rounded-full border border-orange-200/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold leading-5 text-orange-800 backdrop-blur sm:text-sm">
            {t("giftBadge")}
          </div>

          <h1 className="max-w-xl text-3xl font-bold leading-[1.02] tracking-tight text-[var(--brand-dark)] sm:text-5xl">
            {t("titleLine1")}
            <br />
            <span className="text-[var(--section-label)]">{t("titleLine2")}</span>
          </h1>

          <p className="mt-5 max-w-lg text-base font-semibold leading-7 text-[var(--brand-dark)] sm:text-[1.15rem]">
            {t("brandLine")}
          </p>

          <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--muted)] sm:text-[1.03rem] sm:leading-7">
            {t("description")}
          </p>

          <div className="mt-8 hidden w-full max-w-[36rem] lg:block">
            {heroActions}
            <div className="mt-8 w-full">{heroBullets}</div>
          </div>
        </div>

        <div className="relative z-10 min-w-0 lg:justify-self-end lg:w-full lg:max-w-[40rem] lg:pl-4 xl:max-w-[42rem] xl:pl-6">
          <div className="pointer-events-none absolute inset-x-[10%] bottom-3 top-[14%] rounded-full bg-sky-200/35 blur-3xl" />
          <div className="relative">
            <div className="overflow-hidden rounded-[30px] shadow-[0_28px_80px_rgba(22,45,80,0.18)]">
              <Image
                src="/mascots/homepage-hero-plush.png"
                alt={t("imageAlt")}
                width={1152}
                height={768}
                className="h-auto w-full bg-[var(--surface-soft)] object-cover"
                priority
              />
            </div>
            <div className="mt-5 border-t border-white/70 px-1 pt-4">
              <div className="grid grid-cols-2 items-start gap-x-4 text-[10px] sm:gap-x-6 sm:text-sm">
                <div className="min-w-0">
                  <p className="font-semibold leading-4 text-[var(--brand-dark)]">{t("finnleyName")}</p>
                  <p className="mt-0.5 leading-4 text-[var(--muted)] sm:leading-5">{t("finnleyDesc")}</p>
                </div>
                <div className="min-w-0 border-l border-[var(--border)] pl-4 sm:pl-6">
                  <p className="font-semibold leading-4 text-[var(--brand-dark)]">{t("lunaName")}</p>
                  <p className="mt-0.5 leading-4 text-[var(--muted)] sm:leading-5">{t("lunaDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full lg:hidden">
          {heroBullets}
          <div className="mt-8">{heroActions}</div>
        </div>
      </div>
    </section>
  );
}
