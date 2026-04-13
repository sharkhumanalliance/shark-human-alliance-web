"use client";

import { useTranslations } from "next-intl";
import { LocalizedLink } from "@/components/ui/localized-link";
import { MembershipCard } from "@/components/home/membership-card";
import { CertificatePreview } from "@/components/certificate/certificate-preview";
import type { CertificateTemplate } from "@/components/certificate/certificate-document";

type StyleCard = {
  title: string;
  text: string;
  cta: string;
  href: string;
  accent: string;
  template: CertificateTemplate;
  previewTier: string;
  previewName: string;
  registryId: string;
};

export function MembershipPageContent() {
  const t = useTranslations("membershipPage");
  const homeTierT = useTranslations("home.membershipSection");

  const styleCards: StyleCard[] = [
    {
      title: t("styleCards.0.title"),
      text: t("styleCards.0.text"),
      cta: t("styleCards.0.cta"),
      href: "/purchase?tier=protected&template=luxury",
      accent: "border-amber-200 bg-gradient-to-b from-amber-50/60 via-white to-white",
      template: "luxury",
      previewTier: "Protected Friend Status",
      previewName: "Amelia Tide",
      registryId: "SHA-LUX-0713",
    },
    {
      title: t("styleCards.1.title"),
      text: t("styleCards.1.text"),
      cta: t("styleCards.1.cta"),
      href: "/purchase?tier=protected&template=formal",
      accent: "border-slate-200 bg-white",
      template: "formal",
      previewTier: "Protected Friend Status",
      previewName: "Daniel Reef",
      registryId: "SHA-CLA-1032",
    },
    {
      title: t("styleCards.2.title"),
      text: t("styleCards.2.text"),
      cta: t("styleCards.2.cta"),
      href: "/purchase?tier=protected&template=hero",
      accent: "border-cyan-200 bg-gradient-to-b from-cyan-50/60 via-white to-white",
      template: "hero",
      previewTier: "Protected Friend Status",
      previewName: "Sofia Current",
      registryId: "SHA-PLY-2251",
    },
  ];

  const tierCards = [
    {
      id: "protected",
      variant: "protected" as const,
      title: homeTierT("protectedTitle"),
      eyebrow: homeTierT("protectedEyebrow"),
      price: homeTierT("protectedPrice"),
      description: homeTierT("protectedDescription"),
      features: [homeTierT("protectedFeatures.0"), homeTierT("protectedFeatures.1"), homeTierT("protectedFeatures.2")],
      ctaLabel: homeTierT("protectedCta"),
      href: "/purchase?tier=protected",
      popular: true,
      popularLabel: homeTierT("popularBadge"),
    },
    {
      id: "nonsnack",
      variant: "nonsnack" as const,
      title: homeTierT("nonsnackTitle"),
      eyebrow: homeTierT("nonsnackEyebrow"),
      price: homeTierT("nonsnackPrice"),
      description: homeTierT("nonsnackDescription"),
      features: [homeTierT("nonsnackFeatures.0"), homeTierT("nonsnackFeatures.1"), homeTierT("nonsnackFeatures.2")],
      ctaLabel: homeTierT("nonsnackCta"),
      href: "/purchase?tier=nonsnack",
    },
    {
      id: "business",
      variant: "business" as const,
      title: homeTierT("businessTitle"),
      eyebrow: homeTierT("businessEyebrow"),
      price: homeTierT("businessPrice"),
      description: homeTierT("businessDescription"),
      features: [homeTierT("businessFeatures.0"), homeTierT("businessFeatures.1"), homeTierT("businessFeatures.2")],
      ctaLabel: homeTierT("businessCta"),
      href: "/purchase?tier=business",
    },
  ];

  const faqItems = Array.from({ length: 3 }, (_, i) => ({
    question: t(`questionCards.${i}.question`),
    answer: t(`questionCards.${i}.answer`),
  }));

  return (
    <>
      {/* ── 1. HERO — clean, one CTA ── */}
      <section data-reveal className="relative overflow-hidden py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
              {t("title")}
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              {t("description")}
            </p>

            <div className="mt-8">
              <LocalizedLink
                href="#tiers"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto"
              >
                {t("ctaPrimary")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TIERS — core product decision ── */}
      <section data-reveal id="tiers" className="pb-12 pt-8 sm:pb-14 sm:pt-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--section-label)]">
              {t("tiersLabel")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("tiersTitle")}
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {t("tiersDescription")}
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {tierCards.map((card) => (
              <MembershipCard key={card.id} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. STYLES — compact certificate previews ── */}
      <section data-reveal id="styles" className="border-t border-[var(--border)] bg-[var(--surface-soft)] py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--section-label)]">
              {t("stylesLabel")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("stylesTitle")}
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {styleCards.map((card) => (
              <article data-reveal key={card.title} className={`overflow-hidden rounded-2xl border ${card.accent}`}>
                <div className="border-b border-[var(--border)]/50 bg-white/80 p-4">
                  <div className="mx-auto max-w-[220px]">
                    <CertificatePreview
                      name={card.previewName}
                      tier={card.previewTier}
                      date="5 Apr 2026"
                      registryId={card.registryId}
                      template={card.template}
                    />
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-semibold text-[var(--brand-dark)]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{card.text}</p>
                  <LocalizedLink
                    href={card.href}
                    className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand-dark)] transition-colors duration-300 ease-out hover:bg-orange-50"
                  >
                    {card.cta}
                  </LocalizedLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FAQ + LEGAL — merged, compact ── */}
      <section data-reveal className="py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--section-label)]">
              {t("faqLabel")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("faqTitle")}
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {faqItems.map((item) => (
              <article data-reveal key={item.question} className="rounded-xl border border-[var(--border)] bg-white p-5">
                <h3 className="text-lg font-semibold text-[var(--brand-dark)]">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.answer}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {t("clarificationText")}
            </p>
          </div>

          <div className="mt-4">
            <LocalizedLink
              href="/faq"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--section-label)] transition hover:text-[var(--brand-dark)]"
            >
              {t("faqAllLink")} →
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* ── 5. FINAL CTA ── */}
      <section data-reveal id="join" className="bg-[#25527f] pb-16 pt-14 sm:pt-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t("joinTitle")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/95">{t("joinText")}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <LocalizedLink
                href="/purchase?tier=protected"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition-colors duration-300 ease-out hover:bg-[var(--accent-dark)] sm:w-auto"
              >
                {t("joinCtaPrimary")}
              </LocalizedLink>
              <LocalizedLink
                href="/purchase?tier=nonsnack"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg border border-[var(--tier-nonsnack-border)] bg-[var(--tier-nonsnack-surface)] px-6 py-4 text-base font-semibold text-[var(--tier-nonsnack-text)] transition-colors duration-300 ease-out hover:bg-[var(--tier-nonsnack-border)] sm:w-auto"
              >
                {t("joinCtaSecondary")}
              </LocalizedLink>
              <LocalizedLink
                href="/purchase?tier=business"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg border border-[var(--tier-business-border)] bg-[var(--tier-business-light)] px-6 py-4 text-base font-semibold text-[var(--tier-business-text)] transition-colors duration-300 ease-out hover:bg-[var(--tier-business-surface)] sm:w-auto"
              >
                {t("joinCtaBusiness")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
