"use client";

import { useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";

const PARTNERS = [
  { key: 1, url: "https://www.sharktrust.org" },
  { key: 2, url: "https://oceana.org" },
  { key: 3, url: "https://sharks.org" },
  { key: 4, url: "https://www.fundacionmalpelo.org" },
];

const TIER_STYLES = {
  protected: {
    card: "border-orange-200 bg-orange-50/35",
    amount: "text-orange-700",
    barBg: "bg-orange-100",
    barFill: "bg-orange-500",
    percent: "text-orange-700/80",
    title: "text-orange-800",
    link: "text-orange-700 hover:text-orange-800",
  },
  nonsnack: {
    card: "border-teal-200 bg-teal-50/30",
    amount: "text-teal-700",
    barBg: "bg-teal-100",
    barFill: "bg-teal-500",
    percent: "text-teal-700/80",
    title: "text-teal-800",
    link: "text-teal-700 hover:text-teal-800",
  },
  business: {
    card: "border-indigo-200 bg-indigo-50/40",
    amount: "text-indigo-700",
    barBg: "bg-indigo-100",
    barFill: "bg-indigo-400",
    percent: "text-indigo-700/80",
    title: "text-indigo-800",
    link: "text-indigo-700 hover:text-indigo-800",
  },
  accent: {
    card: "border-sky-200 bg-sky-50/35",
    title: "text-sky-800",
    link: "text-sky-700 hover:text-sky-800",
  },
};

const TIERS = [
  {
    variant: "protected",
    barPercent: 20,
    amountKey: "splitProtectedAmount",
    priceKey: "splitProtectedPrice",
    labelKey: "splitProtectedLabel",
    textKey: "splitProtectedText",
  },
  {
    variant: "nonsnack",
    barPercent: 63,
    amountKey: "splitNonsnackAmount",
    priceKey: "splitNonsnackPrice",
    labelKey: "splitNonsnackLabel",
    textKey: "splitNonsnackText",
  },
  {
    variant: "business",
    barPercent: 71,
    amountKey: "splitBusinessAmount",
    priceKey: "splitBusinessPrice",
    labelKey: "splitBusinessLabel",
    textKey: "splitBusinessText",
  },
] as const;

const PARTNER_VARIANTS = ["protected", "nonsnack", "business", "accent"] as const;
const INFO_VARIANTS = ["protected", "nonsnack", "business", "accent"] as const;
const REPORTING_VARIANTS = ["protected", "nonsnack", "business"] as const;

export function ImpactContent() {
  const t = useTranslations("impact");

  return (
    <>
      <section data-reveal className="py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--section-label)]">
              {t("label")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-3 text-lg leading-7 text-[var(--muted)]">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section data-reveal className="pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--brand-dark)]">
            {t("splitTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            {t("splitDescription")}
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {TIERS.map((tier) => {
              const style = TIER_STYLES[tier.variant];
              return (
                <article
                  key={tier.amountKey}
                  className={`rounded-xl border p-6 sm:p-8 ${style.card}`}
                >
                  <div className="flex items-baseline gap-2">
                    <p className={`text-4xl font-bold tabular-nums ${style.amount}`}>
                      {t(tier.amountKey)}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {t("splitOf")} {t(tier.priceKey)}
                    </p>
                  </div>

                  <div
                    className={`mt-4 h-1.5 w-full overflow-hidden rounded-full ${style.barBg}`}
                  >
                    <div
                      className={`h-full rounded-full ${style.barFill}`}
                      style={{ width: `${tier.barPercent}%` }}
                    />
                  </div>
                  <p className={`mt-2 text-xs tabular-nums ${style.percent}`}>
                    {tier.barPercent}% {t("splitGoesToOcean")}
                  </p>

                  <p className={`mt-4 text-sm font-semibold ${style.title}`}>
                    {t(tier.labelKey)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {t(tier.textKey)}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
            <p className="text-sm font-semibold text-[var(--brand-dark)]">
              {t("splitOpsLabel")}
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              {t("splitOpsText")}
            </p>
          </div>
        </div>
      </section>

      <section data-reveal className="bg-[var(--surface-soft)] py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--brand-dark)]">
            {t("partnersTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            {t("partnersSubtitle")}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {PARTNERS.map(({ key, url }, index) => {
              const style = TIER_STYLES[PARTNER_VARIANTS[index]];
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex h-full flex-col rounded-xl border p-6 transition-colors duration-300 ease-out ${style.card}`}
                >
                  <div className="flex h-full flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className={`text-lg font-semibold ${style.title}`}>
                        {t(`partner${key}Name`)}
                      </p>
                      <span className="inline-flex min-h-[30px] items-center rounded-full border border-white/80 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        {t("partnerStatusPlanned")}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      {t(`partner${key}Desc`)}
                    </p>

                    <div className="mt-4 rounded-lg border border-white/70 bg-white/70 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {t("partnerFocusLabel")}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {t(`partner${key}Focus`)}
                      </p>
                    </div>

                    <span
                      className={`mt-6 inline-flex items-center text-sm font-semibold ${style.link}`}
                    >
                      {t("visitWebsite")} {"\u2192"}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>

          <p className="mt-6 text-sm italic text-[var(--muted)]">
            {t("partnersDisclaimer")}
          </p>
        </div>
      </section>

      <section data-reveal className="py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--brand-dark)]">
            {t("selectionTitle")}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i, index) => {
              const style = TIER_STYLES[INFO_VARIANTS[index]];
              return (
                <article
                  data-reveal
                  key={i}
                  className={`rounded-xl border p-6 ${style.card}`}
                >
                  <h3 className={`text-base font-semibold ${style.title}`}>
                    {t(`selectionCriteria${i}Title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {t(`selectionCriteria${i}Text`)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        data-reveal
        className="border-y border-[var(--border)] bg-[var(--surface-soft)] py-12 sm:py-14"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--section-label)]">
              {t("reportingTitle")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("reportingSubtitle")}
            </h2>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start">
            <div className="rounded-xl border border-[var(--border)] bg-white p-5 sm:p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i, index) => {
                  const style = TIER_STYLES[REPORTING_VARIANTS[index]];
                  return (
                    <article
                      data-reveal
                      key={i}
                      className={`rounded-xl border px-4 py-4 sm:px-5 ${style.card}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/85 text-sm font-semibold text-[var(--brand-dark)] shadow-sm">
                          0{i}
                        </div>
                        <div className="min-w-0">
                          <h3 className={`text-base font-semibold ${style.title}`}>
                            {t(`reporting${i}Title`)}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                            {t(`reporting${i}Text`)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-xl border border-[var(--border)] bg-white p-5 sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--section-label)]">
                {t("preReportLabel")}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-[var(--brand-dark)]">
                {t("preReportTitle")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {t("preReportText")}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section data-reveal className="bg-[#25527f] pb-16 pt-14 sm:pt-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-white/95">
              {t("ctaText")}
            </p>
            <div className="mt-8 flex justify-center">
              <LocalizedLink
                href="/purchase?tier=protected"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-4 text-base font-bold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto sm:px-8 sm:text-lg"
              >
                {t("ctaButton")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
