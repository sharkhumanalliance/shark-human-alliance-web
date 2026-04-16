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
    border: "border-orange-200",
    badge: "bg-orange-50 text-orange-800",
    amount: "text-orange-700",
    barBg: "bg-orange-100",
    barFill: "bg-orange-500",
    link: "text-orange-700 hover:text-orange-800",
  },
  nonsnack: {
    border: "border-teal-200",
    badge: "bg-teal-50 text-teal-800",
    amount: "text-teal-700",
    barBg: "bg-teal-100",
    barFill: "bg-teal-500",
    link: "text-teal-700 hover:text-teal-800",
  },
  business: {
    border: "border-indigo-200",
    badge: "bg-indigo-50 text-indigo-800",
    amount: "text-indigo-700",
    barBg: "bg-indigo-100",
    barFill: "bg-indigo-500",
    link: "text-indigo-700 hover:text-indigo-800",
  },
};

const TIERS = [
  {
    variant: "protected",
    barPercent: 25,
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

export function ImpactContent() {
  const t = useTranslations("impact");

  return (
    <>
      <section data-reveal className="py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--section-label)]">
              {t("label")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-7 text-[var(--muted)]">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section data-reveal className="py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("splitTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
              {t("splitDescription")}
            </p>

            <div className="mt-8 overflow-hidden rounded-[28px] border border-[var(--border)] bg-white">
              {TIERS.map((tier, index) => {
                const style = TIER_STYLES[tier.variant];
                return (
                  <article
                    key={tier.amountKey}
                    className={`px-5 py-5 sm:px-6 ${index > 0 ? "border-t border-[var(--border)]" : ""}`}
                  >
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.75fr)] lg:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${style.badge}`}
                          >
                            {t(tier.labelKey)}
                          </span>
                          <span className="text-sm text-[var(--muted)]">
                            {t("splitOf")} {t(tier.priceKey)}
                          </span>
                        </div>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                          {t(tier.textKey)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between gap-3">
                          <p className={`text-3xl font-bold tabular-nums ${style.amount}`}>
                            {t(tier.amountKey)}
                          </p>
                          <p className="text-sm font-semibold tabular-nums text-[var(--muted)]">
                            {tier.barPercent}% {t("splitGoesToOcean")}
                          </p>
                        </div>
                        <div
                          className={`mt-3 h-2.5 w-full overflow-hidden rounded-full ${style.barBg}`}
                        >
                          <div
                            className={`h-full rounded-full ${style.barFill}`}
                            style={{ width: `${tier.barPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="mt-5 max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]/65 px-5 py-4 sm:px-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--section-label)]">
                {t("splitOpsLabel")}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {t("splitOpsText")}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section data-reveal className="bg-[var(--surface-soft)] py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
                {t("partnersTitle")}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
                {t("partnersSubtitle")}
              </p>

              <div className="mt-8 space-y-4">
                {PARTNERS.map(({ key, url }, index) => {
                  const variant =
                    index === 0 ? "protected" : index === 1 ? "nonsnack" : index === 2 ? "business" : "protected";
                  const style = TIER_STYLES[variant];
                  return (
                     <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t(`partner${key}Name`)} - ${t("visitWebsite")} (${t("opensInNewTab")})`}
                        className={`block rounded-2xl border bg-white px-5 py-5 transition-colors duration-300 ease-out hover:bg-sky-50/40 ${style.border}`}
                      >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="text-lg font-semibold text-[var(--brand-dark)]">
                          {t(`partner${key}Name`)}
                        </p>
                        <span className="inline-flex min-h-[30px] items-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                          {t("partnerStatusPlanned")}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                        {t(`partner${key}Desc`)}
                      </p>
                      <div className="mt-4 border-t border-[var(--border)] pt-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                          {t("partnerFocusLabel")}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          {t(`partner${key}Focus`)}
                        </p>
                      </div>
                      <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${style.link}`}>
                        {t("visitWebsite")} {"\u2192"}
                        <span className="text-xs font-medium text-[var(--muted)]">
                          ({t("opensInNewTab")})
                        </span>
                      </span>
                    </a>
                  );
                })}
              </div>

              <p className="mt-6 text-sm italic text-[var(--muted)]">
                {t("partnersDisclaimer")}
              </p>
            </div>

            <div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
                {t("reportingTitle")}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
                {t("reportingSubtitle")}
              </p>

              <div className="mt-8 overflow-hidden rounded-[28px] border border-[var(--border)] bg-white">
                {[1, 2, 3].map((i, index) => (
                  <article
                    key={i}
                    className={`px-5 py-5 sm:px-6 ${index > 0 ? "border-t border-[var(--border)]" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-sm font-semibold text-[var(--brand-dark)]">
                        0{i}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-[var(--brand-dark)]">
                          {t(`reporting${i}Title`)}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          {t(`reporting${i}Text`)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="mt-5 rounded-2xl border border-[var(--border)] bg-white px-5 py-5 sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--section-label)]">
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
        </div>
      </section>

      <section data-reveal className="py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("selectionTitle")}
            </h2>
          </div>

          <div className="mt-8 overflow-hidden rounded-[28px] border border-[var(--border)] bg-white">
            <div className="grid sm:grid-cols-2">
                {[1, 2, 3, 4].map((i, index) => (
                  <article
                    key={i}
                    className={`px-6 py-6 sm:px-7 ${
                      index > 0 ? "border-t border-[var(--border)]" : ""
                    } ${index % 2 === 1 ? "sm:border-l" : ""} ${index >= 2 ? "sm:border-t" : ""}`}
                  >
                    <h3 className="text-xl font-semibold text-[var(--brand-dark)]">
                      {t(`selectionCriteria${i}Title`)}
                    </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {t(`selectionCriteria${i}Text`)}
                  </p>
                </article>
              ))}
            </div>
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
