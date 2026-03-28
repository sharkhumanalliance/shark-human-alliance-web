"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { MembershipCard } from "./membership-card";
import { CertificatePreview } from "@/components/certificate/certificate-preview";
import { CertificateTemplateSelector } from "@/components/certificate/certificate-template-selector";
import type { CertificateTemplate } from "@/components/certificate/certificate-document";
import { trackEvent } from "@/components/analytics";
import { LocalizedLink } from "@/components/ui/localized-link";

const PARTNERS = [
  { i: 1, icon: "🦈", url: "https://www.sharktrust.org" },
  { i: 2, icon: "🌊", url: "https://oceana.org" },
  { i: 3, icon: "🔬", url: "https://sharks.org" },
  { i: 4, icon: "🏝️", url: "https://www.fundacionmalpelo.org" },
];

export function HomeContent() {
  const t = useTranslations("home");
  const [previewName, setPreviewName] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplate>("luxury");

  const previewDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTrackedRef = useRef(false);

  useEffect(() => {
    if (previewName.trim().length < 2) {
      previewTrackedRef.current = false;
      return;
    }

    if (previewTrackedRef.current) return;
    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);

    previewDebounceRef.current = setTimeout(() => {
      previewTrackedRef.current = true;
      trackEvent("certificate_preview_interaction");
    }, 2000);

    return () => {
      if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    };
  }, [previewName]);

  const reviewEmojis = ["🏄", "🐚", "🦈", "🌊", "🐠"];
  const reviews = Array.from({ length: 5 }, (_, i) => ({
    text: t(`reviews.items.${i}.text`),
    author: t(`reviews.items.${i}.author`),
    role: t(`reviews.items.${i}.role`),
    emoji: reviewEmojis[i],
  }));

  const previewPurchaseHref = `/purchase?tier=protected${previewName ? `&name=${encodeURIComponent(previewName.trim())}` : ""}`;
  const previewGiftHref = `/purchase?tier=protected&gift=true${previewName ? `&name=${encodeURIComponent(previewName.trim())}` : ""}`;

  return (
    <>
      <section className="bg-[var(--surface-soft)] py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
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

      <div className="border-y border-[var(--border)] bg-white">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6 px-6 py-5 text-center">
          {[
            { text: t("howStep1"), icon: "📋" },
            { text: t("howStep2"), icon: "🌊" },
            { text: t("howStep3"), icon: "🎁" },
          ].map((step) => (
            <div key={step.text} className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-lg">
                {step.icon}
              </div>
              <p className="text-sm font-medium text-[var(--brand-dark)]">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      <section id="certificate-preview" className="bg-[var(--surface-soft)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,370px)_minmax(0,1fr)] lg:items-start lg:gap-10">
            <div className="lg:sticky lg:top-24">
              <p className="max-w-md text-base font-medium leading-relaxed text-[var(--brand-dark)] md:text-lg">
                {t("about.certPreviewLabel")}
              </p>

              <div className="mt-6 max-w-md">
                <label htmlFor="homepage-preview-name" className="sr-only">
                  {t("about.inputPlaceholder")}
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-white px-5 py-4 shadow-sm transition focus-within:border-teal-400 focus-within:shadow-md">
                  <span className="text-lg" aria-hidden="true">✍️</span>
                  <input
                    id="homepage-preview-name"
                    type="text"
                    value={previewName}
                    onChange={(e) => setPreviewName(e.target.value)}
                    placeholder={t("about.inputPlaceholder")}
                    className="w-full bg-transparent text-base text-[var(--brand-dark)] placeholder:text-[var(--muted)]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 max-w-md">
                <CertificateTemplateSelector value={previewTemplate} onChange={setPreviewTemplate} />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:max-w-md lg:flex-col xl:flex-row">
                <LocalizedLink
                  href={previewPurchaseHref}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)]"
                >
                  🛡️ {t("about.ctaBuy")}
                </LocalizedLink>
                <LocalizedLink
                  href={previewGiftHref}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-8 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:border-[var(--accent)] hover:bg-orange-50"
                >
                  🎁 {t("about.ctaGift")}
                </LocalizedLink>
              </div>
            </div>

            <div className="min-w-0">
              <div className="mx-auto max-w-2xl lg:mx-0">
                <CertificatePreview
                  name={previewName.trim() || t("about.certName")}
                  tier="protected"
                  date={new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  registryId="SHA-XXXX-DIP"
                  template={previewTemplate}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="membership" className="bg-[var(--brand-dark)] py-16 lg:py-20">
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

          <div className="mt-8 grid gap-6 md:grid-cols-2 md:items-stretch">
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
              popular
              popularLabel={t("membershipSection.popularBadge")}
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

          <div className="mt-6 rounded-2xl border border-indigo-200/30 bg-white/10 p-5 text-sky-50">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
              {t("membershipSection.businessEyebrow")}
            </p>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <h3 className="text-2xl font-semibold text-white">
                  {t("membershipSection.businessTitle")} — {t("membershipSection.businessPrice")}
                </h3>
                <p className="mt-2 text-sm leading-6 text-sky-100/80">
                  {t("membershipSection.businessDescription")}
                </p>
              </div>
              <LocalizedLink
                href="/purchase?tier=business"
                className="inline-flex items-center justify-center rounded-lg border border-indigo-300/40 bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                {t("membershipSection.businessCta")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: "🦈", color: "text-[var(--brand-dark)]", key: "1" },
              { icon: "🤝", color: "text-[var(--accent)]", key: "2" },
              { icon: "⚠️", color: "text-[var(--brand-dark)]", key: "3" },
              { icon: "🌍", color: "text-teal-600", key: "4" },
            ].map((stat) => (
              <div key={stat.key} className="rounded-xl border border-[var(--border)] bg-white p-5 text-center shadow-sm">
                <span className="text-2xl">{stat.icon}</span>
                <p className={`mt-2 text-3xl font-bold md:text-4xl ${stat.color}`}>
                  {t(`realImpact.stat${stat.key}Value`)}
                </p>
                <p className="mt-2 text-sm leading-5 text-[var(--muted)]">
                  {t(`realImpact.stat${stat.key}Label`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="real-impact" className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
            {t("realImpact.label")}
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
            {t("realImpact.title")}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">
            {t("impactTeaser.donationsIntro")} {" "}
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
            <LocalizedLink
              href="/impact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
            >
              {t("impactTeaser.linkText")} →
            </LocalizedLink>
          </div>
        </div>
      </section>

      <section className="bg-orange-50/30 py-14">
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
              <div key={i} className="rounded-xl border border-orange-100 bg-white p-6 text-center shadow-sm">
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
            <LocalizedLink
              href="/purchase?tier=protected&gift=true"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)]"
            >
              🎁 {t("giftingSection.cta")}
            </LocalizedLink>
            <LocalizedLink
              href="/wanted"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-8 py-4 text-base font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
            >
              🚨 {t("giftingSection.wantedCta")}
            </LocalizedLink>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
              {t("reviews.label")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("reviews.title")}
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {reviews.slice(0, 3).map((review, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
                  {t("reviews.kicker")}
                </div>
                <p className="mt-3 text-sm italic leading-6 text-[var(--foreground)]">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-lg">
                    {review.emoji}
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

      <section id="faq" className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
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
              <article key={item.question} className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--brand-dark)]">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.answer}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 text-center">
            <LocalizedLink
              href="/faq"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
            >
              {t("faq.allQuestions")} →
            </LocalizedLink>
          </div>
        </div>
      </section>
    </>
  );
}
