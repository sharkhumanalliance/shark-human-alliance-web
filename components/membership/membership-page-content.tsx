"use client";

import { useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";
import { MembershipCard } from "@/components/home/membership-card";

export function MembershipPageContent() {
  const t = useTranslations("membershipPage");
  const comparisonRows = Array.from({ length: 5 }, (_, i) => ({
    label: t(`comparisonRows.${i}.label`),
    protected: t(`comparisonRows.${i}.protected`),
    nonsnack: t(`comparisonRows.${i}.nonsnack`),
    business: t(`comparisonRows.${i}.business`),
  }));

  const faqItems = Array.from({ length: 4 }, (_, i) => ({
    question: t(`faqItems.${i}.question`),
    answer: t(`faqItems.${i}.answer`),
  }));
  const businessFeatures = t.raw("businessFeatures") as string[];

  return (
    <>
      <section className="relative overflow-hidden py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--brand-dark)]">
              {t("badge")}
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
              {t("title")}
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-7 text-[var(--muted)]">
              {t("description")}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <LocalizedLink
                href="/membership#membership"
                className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)]"
              >
                {t("ctaTiers")}
              </LocalizedLink>
              <LocalizedLink
                href="/membership#comparison"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:border-sky-300 hover:bg-sky-50"
              >
                {t("ctaCompare")}
              </LocalizedLink>
            </div>

            <p className="mt-5 text-sm text-[var(--muted)]">
              {t("recommended")} <strong>{t("recommendedProduct")}</strong>.
            </p>
          </div>

        </div>
      </section>

      <section id="membership" className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("tiersLabel")}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("tiersTitle")}
            </h2>
            <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
              {t("tiersDescription")}
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <MembershipCard
              id="protected"
              variant="protected"
              title={t("protectedTitle")}
              price="$5"
              description={t("protectedDescription")}
              features={[t("protectedFeatures.0"), t("protectedFeatures.1"), t("protectedFeatures.2")]}
              ctaLabel={t("protectedCta")}
              href="/purchase?tier=protected"
            />

            <MembershipCard
              id="nonsnack"
              variant="nonsnack"
              title={t("nonsnackTitle")}
              price="$19"
              description={t("nonsnackDescription")}
              features={[t("nonsnackFeatures.0"), t("nonsnackFeatures.1"), t("nonsnackFeatures.2")]}
              ctaLabel={t("nonsnackCta")}
              href="/purchase?tier=nonsnack"
            />
          </div>
        </div>
      </section>

      <section id="comparison" className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("comparisonLabel")}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("comparisonTitle")}
            </h2>
          </div>

          <div className="mt-10 space-y-4 md:hidden">
            {comparisonRows.map((row) => (
              <article key={row.label} className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-[var(--brand-dark)]">{row.label}</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[var(--muted)]">{t("comparisonHeaders.protected")}</dt>
                    <dd className="max-w-[60%] text-right text-[var(--brand-dark)]">{row.protected}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[var(--muted)]">{t("comparisonHeaders.nonsnack")}</dt>
                    <dd className="max-w-[60%] text-right text-[var(--brand-dark)]">{row.nonsnack}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[var(--muted)]">{t("comparisonHeaders.business")}</dt>
                    <dd className="max-w-[60%] text-right text-[var(--brand-dark)]">{row.business}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <div className="mt-10 hidden overflow-x-auto rounded-xl border border-[var(--border)] bg-white shadow-sm md:block">
            <div className="grid min-w-[600px] grid-cols-4 border-b border-[var(--border)] bg-[var(--surface-soft)] text-sm font-semibold text-[var(--brand-dark)]">
              <div className="p-4">{t("comparisonHeaders.feature")}</div>
              <div className="p-4">{t("comparisonHeaders.protected")}</div>
              <div className="p-4">{t("comparisonHeaders.nonsnack")}</div>
              <div className="p-4">{t("comparisonHeaders.business")}</div>
            </div>

            {comparisonRows.map((row, index) => (
              <div
                key={row.label}
                className={`grid min-w-[600px] grid-cols-4 text-sm ${
                  index !== comparisonRows.length - 1
                    ? "border-b border-[var(--border)]"
                    : ""
                }`}
              >
                <div className="p-4 font-medium text-[var(--brand-dark)]">{row.label}</div>
                <div className="p-4 text-[var(--muted)]">{row.protected}</div>
                <div className="p-4 text-[var(--muted)]">{row.nonsnack}</div>
                <div className="p-4 text-[var(--muted)]">{row.business}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: t("step1Title"), text: t("step1Text"), borderColor: "border-sky-100", stepColor: "text-sky-700" },
              { step: "02", title: t("step2Title"), text: t("step2Text"), borderColor: "border-cyan-100", stepColor: "text-cyan-700" },
              { step: "03", title: t("step3Title"), text: t("step3Text"), borderColor: "border-orange-100", stepColor: "text-orange-700" },
            ].map((item) => (
              <article key={item.step} className={`rounded-xl border ${item.borderColor} bg-white p-6 shadow-sm`}>
                <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${item.stepColor}`}>
                  {item.step}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--brand-dark)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("clarificationLabel")}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("clarificationTitle")}
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">
              {t("clarificationText")}
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("faqLabel")}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("faqTitle")}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[var(--brand-dark)]">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Business certification */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-indigo-50 to-white p-8 shadow-sm sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="inline-flex rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-800">
                  🏢 {t("businessBadge")}
                </div>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
                  {t("businessTitle")}
                </h2>
                <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
                  {t("businessDescription")}
                </p>
                <p className="mt-6 text-4xl font-semibold text-[var(--brand-dark)]">$99</p>
                <ul className="mt-6 space-y-3">
                  {businessFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-[var(--foreground)]">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <LocalizedLink
                  href="/purchase?tier=business"
                  className="mt-8 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-indigo-700"
                >
                  {t("businessCta")}
                </LocalizedLink>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full max-w-sm rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-8 text-center">
                  <p className="text-4xl">🏢🦈</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-800">
                    {t("businessCertLabel")}
                  </p>
                  <p className="mt-4 text-2xl font-semibold text-[var(--brand-dark)]">
                    [ {t("businessCertName")} ]
                  </p>
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    {t("businessCertText")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="join" className="pb-16 pt-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-xl border border-sky-900/30 bg-[var(--brand-dark)] px-8 py-12 text-white sm:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
              {t("joinLabel")}
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">
              {t("joinTitle")}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-sky-100/90">
              {t("joinText")}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <LocalizedLink
                href="/purchase?tier=protected"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:bg-sky-50"
              >
                {t("joinCtaPrimary")}
              </LocalizedLink>
              <LocalizedLink
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10"
              >
                {t("joinCtaSecondary")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
