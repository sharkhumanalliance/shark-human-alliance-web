"use client";

import { useTranslations } from "next-intl";
import { MembershipCard } from "./membership-card";

export function HomeContent() {
  const t = useTranslations("home");

  const howItWorksSteps = [
    { step: "01", title: t("howItWorks.step1Title"), text: t("howItWorks.step1Text") },
    { step: "02", title: t("howItWorks.step2Title"), text: t("howItWorks.step2Text") },
    { step: "03", title: t("howItWorks.step3Title"), text: t("howItWorks.step3Text") },
  ];

  const faqItems = Array.from({ length: 6 }, (_, i) => ({
    question: t(`faq.items.${i}.question`),
    answer: t(`faq.items.${i}.answer`),
  }));

  return (
    <>
      {/* Real Impact — the core differentiator */}
      <section id="real-impact" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              {t("realImpact.label")}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("realImpact.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              {t("realImpact.description")}
            </p>
          </div>

          {/* Split bar */}
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="flex h-14 overflow-hidden rounded-full shadow-lg">
              <div className="flex flex-1 items-center justify-center bg-gradient-to-r from-teal-500 to-teal-600 text-sm font-bold text-white">
                {t("realImpact.splitConservation")}
              </div>
              <div className="flex flex-1 items-center justify-center bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-sm font-bold text-white">
                {t("realImpact.splitOperations")}
              </div>
            </div>
          </div>

          {/* Two explanation cards */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-teal-200 bg-gradient-to-b from-teal-50 to-white p-8 shadow-[0_16px_50px_rgba(25,87,138,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-xl">
                  🌊
                </div>
                <h3 className="text-xl font-semibold text-[var(--brand-dark)]">
                  {t("realImpact.forSharksTitle")}
                </h3>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {t("realImpact.forSharksText")}
              </p>
            </div>

            <div className="rounded-[2rem] border border-orange-200 bg-gradient-to-b from-orange-50 to-white p-8 shadow-[0_16px_50px_rgba(25,87,138,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-xl">
                  ☕
                </div>
                <h3 className="text-xl font-semibold text-[var(--brand-dark)]">
                  {t("realImpact.forHumanTitle")}
                </h3>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {t("realImpact.forHumanText")}
              </p>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-sky-100 bg-white p-5 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                {t("realImpact.priceBasic")}
              </p>
              <p className="mt-3">
                <span className="text-xl font-semibold text-teal-600">$4.50</span>
                <span className="text-sm text-[var(--muted)]"> {t("realImpact.conservation")}</span>
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-teal-100 bg-white p-5 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                {t("realImpact.priceProtected")}
              </p>
              <p className="mt-3">
                <span className="text-xl font-semibold text-teal-600">$9.50</span>
                <span className="text-sm text-[var(--muted)]"> {t("realImpact.conservation")}</span>
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-orange-100 bg-white p-5 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                {t("realImpact.priceNonSnack")}
              </p>
              <p className="mt-3">
                <span className="text-xl font-semibold text-teal-600">$14.50</span>
                <span className="text-sm text-[var(--muted)]"> {t("realImpact.conservation")}</span>
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-10 grid gap-4 sm:grid-cols-4">
            <div className="rounded-[1.5rem] border border-sky-100 bg-[var(--surface-soft)] p-4 text-center">
              <p className="text-3xl font-semibold text-[var(--brand-dark)]">{t("realImpact.stat1Value")}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{t("realImpact.stat1Label")}</p>
            </div>
            <div className="rounded-[1.5rem] border border-sky-100 bg-[var(--surface-soft)] p-4 text-center">
              <p className="text-3xl font-semibold text-[var(--brand-dark)]">{t("realImpact.stat2Value")}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{t("realImpact.stat2Label")}</p>
            </div>
            <div className="rounded-[1.5rem] border border-sky-100 bg-[var(--surface-soft)] p-4 text-center">
              <p className="text-3xl font-semibold text-[var(--brand-dark)]">{t("realImpact.stat3Value")}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{t("realImpact.stat3Label")}</p>
            </div>
            <div className="rounded-[1.5rem] border border-sky-100 bg-[var(--surface-soft)] p-4 text-center">
              <p className="text-3xl font-semibold text-[var(--brand-dark)]">{t("realImpact.stat4Value")}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{t("realImpact.stat4Label")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("howItWorks.label")}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("howItWorks.title")}
            </h2>
            <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
              {t("howItWorks.description")}
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {howItWorksSteps.map((item) => (
              <article
                key={item.step}
                className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                  {item.step}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--brand-dark)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("about.label")}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("about.title")}
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
              {t("about.p1")}
            </p>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
              {t("about.p2")}
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_18px_60px_rgba(25,87,138,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("about.certPreviewLabel")}
            </p>

            <div className="mt-6 rounded-[1.75rem] border-2 border-dashed border-sky-200 bg-[var(--surface-soft)] p-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-800">
                {t("about.certTitle")}
              </p>
              <p className="mt-6 text-sm text-[var(--muted)]">
                {t("about.certCertifies")}
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--brand-dark)]">
                {t("about.certName")}
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {t("about.certText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership */}
      <section id="membership" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("membershipSection.label")}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("membershipSection.title")}
            </h2>
            <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
              {t("membershipSection.description")}
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <MembershipCard
              variant="basic"
              title={t("membershipSection.basicTitle")}
              price={t("membershipSection.basicPrice")}
              description={t("membershipSection.basicDescription")}
              features={[
                t("membershipSection.basicFeatures.0"),
                t("membershipSection.basicFeatures.1"),
                t("membershipSection.basicFeatures.2"),
              ]}
              ctaLabel={t("membershipSection.basicCta")}
              href="/purchase?tier=basic"
            />

            <MembershipCard
              variant="protected"
              title={t("membershipSection.protectedTitle")}
              price={t("membershipSection.protectedPrice")}
              description={t("membershipSection.protectedDescription")}
              features={[
                t("membershipSection.protectedFeatures.0"),
                t("membershipSection.protectedFeatures.1"),
                t("membershipSection.protectedFeatures.2"),
              ]}
              ctaLabel={t("membershipSection.protectedCta")}
              href="/purchase?tier=protected"
            />

            <MembershipCard
              variant="nonsnack"
              title={t("membershipSection.nonsnackTitle")}
              price={t("membershipSection.nonsnackPrice")}
              description={t("membershipSection.nonsnackDescription")}
              features={[
                t("membershipSection.nonsnackFeatures.0"),
                t("membershipSection.nonsnackFeatures.1"),
                t("membershipSection.nonsnackFeatures.2"),
              ]}
              ctaLabel={t("membershipSection.nonsnackCta")}
              href="/purchase?tier=nonsnack"
            />
          </div>
        </div>
      </section>

      {/* Transparency note */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-[2rem] border border-white/70 bg-[var(--surface-soft)] p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                  {t("transparency.transparencyLabel")}
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-[var(--brand-dark)]">
                  {t("transparency.transparencyTitle")}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {t("transparency.transparencyText")}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                  {t("transparency.legalLabel")}
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-[var(--brand-dark)]">
                  {t("transparency.legalTitle")}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {t("transparency.legalText")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("faq.label")}
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("faq.title")}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]"
              >
                <h3 className="text-xl font-semibold text-[var(--brand-dark)]">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
