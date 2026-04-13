"use client";

import { useTranslations } from "next-intl";

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
                    <p className={`text-4xl font-bold ${style.amount}`}>
                      {t(tier.amountKey)}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {t("splitOf")} {t(tier.priceKey)}
                    </p>
                  </div>

                  <div className={`mt-4 h-1.5 w-full overflow-hidden rounded-full ${style.barBg}`}>
                    <div
                      className={`h-full rounded-full ${style.barFill}`}
                      style={{ width: `${tier.barPercent}%` }}
                    />
                  </div>
                  <p className={`mt-2 text-xs ${style.percent}`}>
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
                    <p className={`text-lg font-semibold ${style.title}`}>
                      {t(`partner${key}Name`)}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      {t(`partner${key}Desc`)}
                    </p>

                    <div className="mt-4 rounded-lg border border-white/70 bg-white/70 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {t("partnerFocusLabel")}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {t(`partner${key}Focus`).replace(/^[^:]+:\s*/, "")}
                      </p>
                    </div>

                    <span className={`mt-6 inline-flex items-center text-sm font-semibold ${style.link}`}>
                      {t("visitWebsite")} →
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
                <article data-reveal key={i} className={`rounded-xl border p-6 ${style.card}`}>
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

      <section data-reveal className="border-y border-[var(--border)] bg-[var(--surface-soft)] py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--brand-dark)]">
            {t("reportingTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            {t("reportingSubtitle")}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {[1, 2, 3].map((i, index) => {
              const style = TIER_STYLES[REPORTING_VARIANTS[index]];
              return (
                <article data-reveal key={i} className={`rounded-xl border p-6 ${style.card}`}>
                  <h3 className={`text-base font-semibold ${style.title}`}>
                    {t(`reporting${i}Title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {t(`reporting${i}Text`)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section data-reveal className="py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-xl border border-[var(--border)] bg-white p-5 sm:p-8">
            <h3 className="text-lg font-semibold text-[var(--brand-dark)]">
              {t("preReportTitle")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {t("preReportText")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
