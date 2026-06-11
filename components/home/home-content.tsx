"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MembershipCard } from "./membership-card";
import { CertificatePreview } from "@/components/certificate/certificate-preview";
import { CertificateTemplateSelector } from "@/components/certificate/certificate-template-selector";
import type { CertificateTemplate } from "@/components/certificate/certificate-document";
import { FirstDonationTarget } from "@/components/impact/first-donation-target";
import { trackEvent } from "@/components/analytics";
import { ANALYTICS_SOURCES } from "@/lib/analytics-events";
import { LocalizedLink } from "@/components/ui/localized-link";
import { formatCertificateDate } from "@/lib/dates";
import { getTierPriceLabel } from "@/lib/tiers";

const PARTNERS = [
  { i: 1, url: "https://www.sharktrust.org" },
  { i: 2, url: "https://oceana.org" },
  { i: 3, url: "https://www.sharkconservationfund.org/" },
  { i: 4, url: "https://www.fundacionmalpelo.org" },
];

export function HomeContent() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [previewName, setPreviewName] = useState("");
  const [previewTemplate, setPreviewTemplate] =
    useState<CertificateTemplate>("luxury");

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

  const previewPurchaseHref = `/purchase?tier=protected${
    previewName ? `&name=${encodeURIComponent(previewName.trim())}` : ""
  }`;
  const previewGiftHref = `/purchase?tier=protected&gift=true${
    previewName ? `&name=${encodeURIComponent(previewName.trim())}` : ""
  }`;

  const valueItems = [
    { title: t("valueHook.point1Title"), text: t("valueHook.point1Text") },
    { title: t("valueHook.point2Title"), text: t("valueHook.point2Text") },
    { title: t("valueHook.point3Title"), text: t("valueHook.point3Text") },
  ];

  const impactStats = [
    {
      key: "1",
      valueClass: "text-[var(--brand-dark)]",
      bgClass: "bg-[var(--surface-soft)]/50 border-[var(--border)]",
    },
    {
      key: "2",
      valueClass: "text-[var(--tier-protected-text)]",
      bgClass: "bg-[var(--tier-protected-light)]/35 border-[var(--tier-protected-border-light)]",
    },
    {
      key: "3",
      valueClass: "text-[var(--tier-nonsnack-text)]",
      bgClass: "bg-[var(--tier-nonsnack-light)]/30 border-[var(--tier-nonsnack-border-light)]",
    },
    {
      key: "4",
      valueClass: "text-[var(--tier-business-text)]",
      bgClass: "bg-[var(--tier-business-light)]/45 border-[var(--tier-business-border-light)]",
    },
  ];

  const previewDate = formatCertificateDate(new Date(), locale);

  return (
    <>
      <section data-reveal className="bg-white py-8 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--section-label)] sm:text-sm sm:tracking-[0.18em]">
              {t("valueHook.label")}
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-tight tracking-tight text-[var(--brand-dark)] sm:mt-3 sm:text-4xl">
              {t("valueHook.title")}
            </h2>
          </div>

          <div className="mt-5 overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface-soft)] sm:mt-8 sm:rounded-[24px]">
            <div className="grid divide-y divide-[var(--border)] md:grid-cols-3 md:divide-x md:divide-y-0">
              {valueItems.map((item) => (
                <article
                  data-reveal
                  key={item.title}
                  className="px-4 py-4 sm:px-6 sm:py-6"
                >
                  <h3 className="text-base font-semibold text-[var(--brand-dark)] sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-5 text-[var(--muted)] sm:mt-2 sm:leading-6">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

        <section
          data-reveal
          id="certificate-preview"
          className="scroll-mt-28 bg-[var(--surface-soft)] py-10 sm:py-12 lg:py-14"
        >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,370px)_minmax(0,1fr)] lg:items-start lg:gap-10">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-5 lg:border-0 lg:bg-transparent lg:p-0">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                  {t("about.previewSectionLabel")}
                </p>
                <p className="mt-2 max-w-md text-sm font-medium leading-7 text-[var(--brand-dark)] sm:text-base md:text-lg">
                  {t("about.certPreviewLabel")}
                </p>

                <div className="mt-6 max-w-md">
                  <label htmlFor="homepage-preview-name" className="sr-only">
                    {t("about.inputPlaceholder")}
                  </label>
                  <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3.5 transition focus-within:border-slate-400 sm:px-5 sm:py-4">
                    <input
                      id="homepage-preview-name"
                      name="homepage_preview_name"
                      type="text"
                      autoComplete="name"
                      inputMode="text"
                      value={previewName}
                      onChange={(e) => setPreviewName(e.target.value)}
                      placeholder={t("about.inputPlaceholder")}
                      className="w-full bg-transparent text-base text-[var(--brand-dark)] placeholder:text-[var(--muted)]/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-5 max-w-md">
                  <CertificateTemplateSelector
                    value={previewTemplate}
                    onChange={setPreviewTemplate}
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:max-w-md lg:flex-col">
                  <LocalizedLink
                    href={previewPurchaseHref}
                    className="inline-flex min-h-[48px] w-full items-center justify-center whitespace-nowrap rounded-lg bg-[var(--accent)] px-6 py-4 text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto sm:px-8 sm:text-base lg:w-full"
                  >
                    {t("about.ctaBuy")}
                  </LocalizedLink>
                  <LocalizedLink
                    href={previewGiftHref}
                    className="inline-flex min-h-[48px] w-full items-center justify-center whitespace-nowrap rounded-lg border border-[var(--border)] bg-white px-6 py-4 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-[var(--surface-soft)] sm:w-auto sm:px-8 sm:text-base lg:w-full"
                  >
                    {t("about.ctaGift")}
                  </LocalizedLink>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="mx-auto max-w-2xl lg:mx-0">
                <CertificatePreview
                  name={previewName.trim() || t("about.certName")}
                  tier="protected"
                  date={previewDate}
                  registryId="SHA-XXXX-DIP"
                  template={previewTemplate}
                  locale={locale}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-reveal id="membership" className="bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
              {t("membershipSection.label")}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("membershipSection.title")}
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              {t("membershipSection.description")}
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:mt-8 md:grid-cols-3 md:items-stretch md:gap-6">
              <MembershipCard
                variant="protected"
                title={t("membershipSection.protectedTitle")}
                price={getTierPriceLabel("protected")}
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
              eyebrow={t("membershipSection.protectedEyebrow")}
            />

              <MembershipCard
                variant="nonsnack"
                title={t("membershipSection.nonsnackTitle")}
                price={getTierPriceLabel("nonsnack")}
              description={t("membershipSection.nonsnackDescription")}
              features={[
                t("membershipSection.nonsnackFeatures.0"),
                t("membershipSection.nonsnackFeatures.1"),
                t("membershipSection.nonsnackFeatures.2"),
              ]}
              ctaLabel={t("membershipSection.nonsnackCta")}
              href="/purchase?tier=nonsnack"
              eyebrow={t("membershipSection.nonsnackEyebrow")}
            />

              <MembershipCard
                variant="business"
                title={t("membershipSection.businessTitle")}
                price={getTierPriceLabel("business")}
              description={t("membershipSection.businessDescription")}
              features={[
                t("membershipSection.businessFeatures.0"),
                t("membershipSection.businessFeatures.1"),
                t("membershipSection.businessFeatures.2"),
              ]}
              ctaLabel={t("membershipSection.businessCta")}
              href="/purchase?tier=business"
              eyebrow={t("membershipSection.businessEyebrow")}
            />
          </div>
        </div>
      </section>

      <section
        data-reveal
        id="real-impact"
        className="bg-[var(--surface-soft)] py-10 sm:py-12"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
              {t("realImpact.label")}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("realImpact.title")}
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-white sm:col-span-2 md:col-span-4">
              <div className="grid divide-y divide-[var(--border)] md:grid-cols-4 md:divide-x md:divide-y-0">
                {impactStats.map(({ key, valueClass, bgClass }) => (
                  <div
                    key={key}
                    className={`flex min-h-[132px] flex-col justify-center px-5 py-5 text-left sm:px-6 ${bgClass}`}
                  >
                    <p
                      className={`text-3xl font-bold tracking-tight md:text-4xl ${valueClass}`}
                    >
                      {t(`realImpact.stat${key}Value`)}
                    </p>
                    <p className="mt-2.5 max-w-[13rem] text-sm leading-5 text-[var(--muted)]">
                      {t(`realImpact.stat${key}Label`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]/75">
            {t("realImpact.statsSourceLine")}
          </p>

            <p className="mt-8 max-w-2xl text-base leading-7 text-[var(--muted)]">
              {t("impactTeaser.donationsIntro")}{" "}
            {PARTNERS.map(({ i, url }, idx) => (
              <span key={i}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--brand-dark)] underline decoration-slate-300 underline-offset-2 transition hover:text-[var(--section-label)] hover:decoration-slate-500"
                >
                  {t(`realImpact.partner${i}Name`)}
                </a>
                {idx < PARTNERS.length - 1
                  ? idx === PARTNERS.length - 2
                    ? ` ${t("impactTeaser.and")} `
                    : ", "
                  : ". "}
              </span>
            ))}
              {t("impactTeaser.opsJoke")}
            </p>

            <div className="mt-6 max-w-3xl">
              <FirstDonationTarget compact />
            </div>

            <div className="mt-6">
            <LocalizedLink
              href="/impact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--section-label)] transition hover:text-[var(--brand-dark)]"
            >
              {t("impactTeaser.linkText")} {"\u2192"}
            </LocalizedLink>
          </div>
        </div>
      </section>

      <section data-reveal id="wanted-teaser" className="bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)]/60 px-5 py-7 sm:px-8 sm:py-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--section-label)]">
                  {t("wantedTeaser.label")}
                </p>
                <span
                  aria-hidden="true"
                  className="inline-block -rotate-3 rounded border border-[#B94135]/70 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#B94135]"
                >
                  {t("wantedTeaser.stamp")}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-3xl">
                {t("wantedTeaser.title")}
              </h2>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                {t("wantedTeaser.text")}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-5">
              <div
                aria-hidden="true"
                className="w-40 -rotate-2 rounded-md border border-[#3A2515]/25 bg-[#F6ECD8] px-3 py-3 shadow-sm"
              >
                <p className="text-center font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#3A2515]">
                  Wanted
                </p>
                <div className="mt-2 overflow-hidden rounded-sm border border-[#3A2515]/15">
                  <Image
                    src="/wanted-poster_picture.png"
                    alt=""
                    width={1448}
                    height={1086}
                    sizes="160px"
                    className="h-auto w-full"
                  />
                </div>
                <div className="mt-2 space-y-1">
                  <div className="h-1 w-full rounded bg-[#3A2515]/20" />
                  <div className="h-1 w-3/4 rounded bg-[#3A2515]/20" />
                </div>
                <p className="mt-2 text-center font-mono text-[8px] uppercase tracking-[0.14em] text-[#3A2515]/60">
                  Case No. 0042
                </p>
              </div>
              <LocalizedLink
                href="/wanted"
                onClick={() =>
                  trackEvent("wanted_teaser_click", {
                    source: ANALYTICS_SOURCES.homeWanted,
                  })
                }
                className="inline-flex min-h-[48px] w-full items-center justify-center whitespace-nowrap rounded-lg border border-[#B94135] bg-white px-7 py-3.5 text-sm font-semibold text-[#B94135] transition-colors duration-300 ease-out hover:bg-[#B94135] hover:text-white sm:text-base md:w-auto"
              >
                {t("wantedTeaser.cta")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>

      <section
        data-reveal
        id="home-final-cta"
        className="bg-[#25527f] pb-16 pt-14 sm:pt-16"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-white">
            {t("earlyAdopter.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/95">
            {t("earlyAdopter.text")}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LocalizedLink
              href="/purchase?tier=protected"
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--accent-dark)] sm:w-auto"
            >
              {t("earlyAdopter.purchaseCta")} {"\u2192"}
            </LocalizedLink>
            <LocalizedLink
              href="/faq"
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg border border-white/70 bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-dark)] shadow-sm transition-colors hover:border-white hover:bg-white/90 sm:w-auto"
            >
              {t("faq.allQuestions")} {"\u2192"}
            </LocalizedLink>
          </div>
        </div>
      </section>
    </>
  );
}
