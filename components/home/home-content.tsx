"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { MembershipCard } from "./membership-card";
import { CertificatePreview } from "@/components/certificate/certificate-preview";

function useCertTranslations() {
  const ct = useTranslations("certificate");
  return {
    header: ct("header"),
    subtitle: ct("subtitle"),
    certTitle: ct("certTitle"),
    certifies: ct("certifies"),
    statusLabel: ct("statusLabel"),
    tierName: ct("tierNames.protected"),
    body: ct("body"),
    reasonsLabel: ct("reasonsLabel"),
    reasons: Array.from({ length: 8 }, (_, i) => { try { return ct(`reasons.${i}`); } catch { return ''; } }).filter(Boolean),
    privileges: ct("privileges"),
    validityNote: ct("validityNote"),
    sig1Name: ct("sig1Name"),
    sig1Title: ct("sig1Title"),
    sig2Name: ct("sig2Name"),
    sig2Title: ct("sig2Title"),
    sealText: ct("sealText"),
    dedicationLabel: ct("dedication"),
    dateLabel: ct("dateLabel"),
    registryIdLabel: ct("registryId"),
    disclaimer: ct("disclaimer"),
  };
}

const PARTNERS = [
  { i: 1, icon: "🦈", url: "https://www.sharktrust.org" },
  { i: 2, icon: "🌊", url: "https://oceana.org" },
  { i: 3, icon: "🔬", url: "https://sharks.org" },
  { i: 4, icon: "🏝️", url: "https://www.fundacionmalpelo.org" },
];

export function HomeContent() {
  const t = useTranslations("home");
  const certT = useCertTranslations();
  const [previewName, setPreviewName] = useState("");

  const reviews = Array.from({ length: 5 }, (_, i) => ({
    text: t(`reviews.items.${i}.text`),
    author: t(`reviews.items.${i}.author`),
    role: t(`reviews.items.${i}.role`),
  }));

  return (
    <>
      {/* 1 — Value prop + impact hook */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              {t("valueHook.label")}
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("valueHook.title")}
            </h2>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <span className="text-4xl">{t(`valueHook.point${i}Icon`)}</span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--brand-dark)]">
                  {t(`valueHook.point${i}Title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {t(`valueHook.point${i}Text`)}
                </p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-[var(--muted)]">
            {t("valueHook.impactLine")}
          </p>
        </div>
      </section>

      {/* How it works strip */}
      <div className="border-y border-sky-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6 px-6 py-5 text-center">
          {[
            { num: "1", text: t("howStep1"), icon: "📋" },
            { num: "2", text: t("howStep2"), icon: "🌊" },
            { num: "3", text: t("howStep3"), icon: "🎁" },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-lg">
                {step.icon}
              </div>
              <p className="text-sm font-medium text-[var(--brand-dark)]">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2 — Certificate Preview (interactive) */}
      <section id="certificate-preview" className="py-10 bg-gradient-to-b from-sky-50/50 to-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-lg mx-auto">
            <p className="text-base md:text-lg font-medium text-[var(--brand-dark)] leading-relaxed">
              {t("about.certPreviewLabel")}
            </p>
          </div>

          {/* Live name input */}
          <div className="mx-auto mt-6 max-w-md">
            <div className="flex items-center gap-3 rounded-2xl border-2 border-teal-200 bg-white px-5 py-4 shadow-[0_8px_30px_rgba(25,87,138,0.08)] transition focus-within:border-teal-400 focus-within:shadow-[0_8px_30px_rgba(25,87,138,0.15)]">
              <span className="text-lg" aria-hidden="true">✍️</span>
              <input
                type="text"
                value={previewName}
                onChange={(e) => setPreviewName(e.target.value)}
                placeholder={t("about.inputPlaceholder")}
                className="w-full bg-transparent text-base text-[var(--brand-dark)] placeholder:text-[var(--muted)]/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 mx-auto max-w-2xl">
            <CertificatePreview
              name={previewName.trim() || t("about.certName")}
              tier="protected"
              date={new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              registryId="SHA-XXXX-DIP"
              t={certT}
            />
          </div>

          {/* Dual CTA */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={`/purchase?tier=protected${previewName ? `&name=${encodeURIComponent(previewName.trim())}` : ""}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-200/50 transition hover:bg-[var(--accent-dark)]"
            >
              🛡️ {t("about.ctaBuy")}
            </a>
            <a
              href={`/purchase?tier=protected&gift=true${previewName ? `&name=${encodeURIComponent(previewName.trim())}` : ""}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-orange-200 bg-white px-8 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:border-orange-300 hover:bg-orange-50"
            >
              🎁 {t("about.ctaGift")}
            </a>
          </div>
        </div>
      </section>

      {/* 3 — Membership tiers (dark) */}
      <section id="membership" className="py-10 bg-[var(--brand-dark)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
              {t("membershipSection.label")}
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">
              {t("membershipSection.title")}
            </h2>
            <p className="mt-3 text-lg leading-8 text-sky-100/80">
              {t("membershipSection.description")}
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="relative">
              <div className="absolute -top-3 left-6 z-10 inline-flex rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                {t("membershipSection.popularBadge")}
              </div>
              <div className="rounded-[2rem] border-2 border-teal-400/50 bg-white p-6 shadow-[0_16px_50px_rgba(25,87,138,0.2)] ring-2 ring-teal-400/20">
                <div className="inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
                  {t("membershipSection.protectedTitle")}
                </div>
                <p className="mt-5 text-3xl font-semibold text-[var(--brand-dark)]">
                  {t("membershipSection.protectedPrice")}
                </p>
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                  {t("membershipSection.protectedDescription")}
                </p>
                <ul className="mt-6 space-y-3">
                  {[0, 1, 2].map((i) => (
                    <li key={i} className="flex items-start gap-3 text-sm leading-6 text-[var(--foreground)]">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                      <span>{t(`membershipSection.protectedFeatures.${i}`)}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/purchase?tier=protected"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
                >
                  {t("membershipSection.protectedCta")}
                </a>
              </div>
            </div>

            <MembershipCard
              variant="nonsnack"
              title={t("membershipSection.nonsnackTitle")}
              price={t("membershipSection.nonsnackPrice")}
              description={t("membershipSection.nonsnackDescription")}
              features={[
                t("membershipSection.nonsnackFeatures.0"),
                t("membershipSection.nonsnackFeatures.1"),
                t("membershipSection.nonsnackFeatures.2"),
                t("membershipSection.nonsnackFeatures.3"),
              ]}
              ctaLabel={t("membershipSection.nonsnackCta")}
              href="/purchase?tier=nonsnack"
            />

            <MembershipCard
              variant="business"
              title={t("membershipSection.businessTitle")}
              price={t("membershipSection.businessPrice")}
              description={t("membershipSection.businessDescription")}
              features={[
                t("membershipSection.businessFeatures.0"),
                t("membershipSection.businessFeatures.1"),
                t("membershipSection.businessFeatures.2"),
              ]}
              ctaLabel={t("membershipSection.businessCta")}
              href="/purchase?tier=business"
            />
          </div>
        </div>
      </section>

      {/* 4 — Stats */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-[var(--brand-dark)] md:text-5xl">{t("realImpact.stat1Value")}</p>
              <p className="mt-2 text-sm leading-5 text-[var(--muted)]">{t("realImpact.stat1Label")}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-[var(--accent)] md:text-5xl">{t("realImpact.stat2Value")}</p>
              <p className="mt-2 text-sm leading-5 text-[var(--muted)]">{t("realImpact.stat2Label")}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-[var(--brand-dark)] md:text-5xl">{t("realImpact.stat3Value")}</p>
              <p className="mt-2 text-sm leading-5 text-[var(--muted)]">{t("realImpact.stat3Label")}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-teal-600 md:text-5xl">{t("realImpact.stat4Value")}</p>
              <p className="mt-2 text-sm leading-5 text-[var(--muted)]">{t("realImpact.stat4Label")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — Impact teaser */}
      <section id="real-impact" className="py-10">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
            {t("realImpact.label")}
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
            {t("realImpact.title")}
          </h2>

          {/* Partner links inline */}
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">
            {t("impactTeaser.donationsIntro")}{" "}
            {PARTNERS.map(({ i, url }, idx) => (
              <span key={i}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal-700 underline decoration-teal-300 underline-offset-2 transition hover:text-teal-900 hover:decoration-teal-500"
                >
                  {t(`realImpact.partner${i}Name`)}
                </a>
                {idx < PARTNERS.length - 1 ? (idx === PARTNERS.length - 2 ? ` ${t("impactTeaser.and")} ` : ", ") : ". "}
              </span>
            ))}
            {t("impactTeaser.opsJoke")}
          </p>

          <div className="mt-6">
            <a
              href="/impact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
            >
              {t("impactTeaser.linkText")} →
            </a>
          </div>
        </div>
      </section>

      {/* 6 — Gifting */}
      <section className="py-10 bg-gradient-to-b from-white to-orange-50/30">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-700">
              {t("giftingSection.label")}
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("giftingSection.title")}
            </h2>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-[2rem] border border-orange-100 bg-white p-6 text-center shadow-[0_16px_50px_rgba(25,87,138,0.08)]">
                <p className="text-3xl">{t(`giftingSection.case${i}Icon`)}</p>
                <h3 className="mt-3 text-lg font-semibold text-[var(--brand-dark)]">
                  {t(`giftingSection.case${i}Title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {t(`giftingSection.case${i}Text`)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="/purchase?tier=protected&gift=true"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-200/50 transition hover:bg-[var(--accent-dark)]"
            >
              🎁 {t("giftingSection.cta")}
            </a>
            <a
              href="/wanted"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-red-200 bg-white px-8 py-4 text-base font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
            >
              🚨 {t("giftingSection.wantedCta")}
            </a>
          </div>
        </div>
      </section>

      {/* 7 — Reviews */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              {t("reviews.label")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("reviews.title")}
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {reviews.slice(0, 3).map((review, i) => (
              <div
                key={i}
                className="rounded-[2rem] border border-sky-100 bg-[var(--surface-soft)] p-5 shadow-sm"
              >
                <div className="flex gap-1 text-orange-400" aria-label="5 stars">
                  {"★★★★★".split("").map((star, j) => (
                    <span key={j} className="text-lg" aria-hidden="true">{star}</span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--foreground)] italic">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--brand-dark)]">{review.author}</p>
                    <p className="text-xs text-[var(--muted)]">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 — Mini FAQ (3 questions + link) */}
      <section id="faq" className="py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("faq.label")}
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("faq.title")}
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => ({
              question: t(`faq.items.${i}.question`),
              answer: t(`faq.items.${i}.answer`),
            })).map((item) => (
              <article
                key={item.question}
                className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]"
              >
                <h3 className="text-lg font-semibold text-[var(--brand-dark)]">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 text-center">
            <a
              href="/faq"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
            >
              {t("faq.allQuestions")} →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
