"use client";

import { useTranslations } from "next-intl";

const PARTNERS = [
  { key: 1, icon: "🦈", url: "https://www.sharktrust.org" },
  { key: 2, icon: "🌊", url: "https://oceana.org" },
  { key: 3, icon: "🔬", url: "https://sharks.org" },
  { key: 4, icon: "🏝️", url: "https://www.fundacionmalpelo.org" },
];

export function ImpactContent() {
  const t = useTranslations("impact");

  return (
    <>
      {/* Hero */}
      <section className="py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              {t("label")}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-3 text-lg leading-7 text-[var(--muted)]">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Fund split */}
      <section className="pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--brand-dark)]">
            {t("splitTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            {t("splitDescription")}
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {/* Protected / Non-Snack */}
            <div className="rounded-[2rem] border border-teal-200 bg-gradient-to-b from-teal-50 to-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-2xl">
                🛡️
              </div>
              <p className="mt-4 text-3xl font-bold text-teal-700">{t("splitPersonalPercent")}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--brand-dark)]">{t("splitPersonalLabel")}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{t("splitPersonalText")}</p>
            </div>

            {/* Business */}
            <div className="rounded-[2rem] border border-indigo-200 bg-gradient-to-b from-indigo-50 to-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                🏢
              </div>
              <p className="mt-4 text-3xl font-bold text-indigo-700">{t("splitBusinessPercent")}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--brand-dark)]">{t("splitBusinessLabel")}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{t("splitBusinessText")}</p>
            </div>

            {/* Operations */}
            <div className="rounded-[2rem] border border-sky-200 bg-gradient-to-b from-sky-50 to-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl">
                ⚙️
              </div>
              <p className="mt-4 text-3xl font-bold text-sky-700">{t("splitOpsPercent")}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--brand-dark)]">{t("splitOpsLabel")}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{t("splitOpsText")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner organizations */}
      <section className="py-12 bg-[var(--surface-soft)]">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--brand-dark)]">
            {t("partnersTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            {t("partnersSubtitle")}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {PARTNERS.map(({ key, icon, url }) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-5 rounded-[2rem] border border-teal-100 bg-white p-6 shadow-sm transition hover:border-teal-300 hover:shadow-md"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-2xl">
                  {icon}
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--brand-dark)] group-hover:text-[var(--brand)]">
                    {t(`partner${key}Name`)}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    {t(`partner${key}Desc`)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {t(`partner${key}Focus`)}
                  </p>
                  <span className="mt-2 inline-block text-xs font-medium text-teal-600 opacity-0 transition group-hover:opacity-100">
                    {t("visitWebsite")} →
                  </span>
                </div>
              </a>
            ))}
          </div>

          <p className="mt-6 text-sm italic text-[var(--muted)]">
            {t("partnersDisclaimer")}
          </p>
        </div>
      </section>

      {/* How we select partners */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--brand-dark)]">
            {t("selectionTitle")}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-[2rem] border border-sky-100 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-lg font-bold text-[var(--brand)]">
                  {i}
                </div>
                <h3 className="mt-4 text-base font-semibold text-[var(--brand-dark)]">
                  {t(`selectionCriteria${i}Title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {t(`selectionCriteria${i}Text`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reporting & Transparency */}
      <section className="py-12 bg-[var(--brand-dark)]">
        <div className="mx-auto max-w-6xl px-6 text-white">
          <h2 className="text-3xl font-semibold tracking-tight">
            {t("reportingTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-sky-100/80">
            {t("reportingSubtitle")}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[2rem] border border-sky-100/20 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-2xl">{t(`reporting${i}Icon`)}</p>
                <h3 className="mt-3 text-base font-semibold text-white">
                  {t(`reporting${i}Title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-sky-100/70">
                  {t(`reporting${i}Text`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pre-first-report notice */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-[2rem] border border-orange-200 bg-orange-50/50 p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-xl">
                📋
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--brand-dark)]">
                  {t("preReportTitle")}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  {t("preReportText")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-[2.25rem] border border-sky-900/30 bg-[var(--brand-dark)] px-8 py-12 text-center text-white shadow-[0_22px_80px_rgba(15,39,64,0.25)] sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-sky-100/80">
              {t("ctaText")}
            </p>
            <div className="mt-6">
              <a
                href="/purchase?tier=protected"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:bg-sky-50"
              >
                {t("ctaButton")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
