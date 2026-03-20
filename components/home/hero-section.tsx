"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        {/* Left — copy */}
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-800 shadow-sm">
            {t("giftBadge")}
          </div>

          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
            {t("titleLine1")}
            <br />
            <span className="text-[var(--brand)]">{t("titleLine2")}</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
            {t("description")}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="/purchase?tier=protected"
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-7 py-4 text-base font-semibold text-white shadow-lg shadow-orange-200/50 transition hover:bg-[var(--accent-dark)] hover:shadow-xl hover:shadow-orange-200/60"
            >
              {t("ctaPrimary")}
            </a>

            <a
              href="#certificate-preview"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:border-sky-300 hover:bg-sky-50"
            >
              {t("ctaSecondary")}
            </a>
          </div>

          <p className="mt-4 text-sm italic text-[var(--brand)]">
            {t("brandLine")}
          </p>
        </div>

        {/* Right — image + ambassadors */}
        <div className="relative">
          <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute -right-10 bottom-6 h-36 w-36 rounded-full bg-sky-300/30 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-[0_24px_80px_rgba(25,87,138,0.12)]">
            <div className="p-4">
              <Image
                src="/mascots/finnley-luna-hero.png"
                alt={t("imageAlt")}
                width={1400}
                height={1100}
                className="h-auto w-full rounded-[1.5rem]"
                priority
              />
            </div>

            <div className="grid grid-cols-2 gap-px bg-sky-100">
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
