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
      title: t("protectedTitle"),
      price: "$4",
      description: t("protectedDescription"),
      features: [t("protectedFeatures.0"), t("protectedFeatures.1"), t("protectedFeatures.2")],
      ctaLabel: t("protectedCta"),
      href: "/purchase?tier=protected",
      popular: true,
      popularLabel: t("protectedPopular"),
    },
    {
      id: "nonsnack",
      variant: "nonsnack" as const,
      title: t("nonsnackTitle"),
      price: "$19",
      description: t("nonsnackDescription"),
      features: [t("nonsnackFeatures.0"), t("nonsnackFeatures.1"), t("nonsnackFeatures.2")],
      ctaLabel: t("nonsnackCta"),
      href: "/purchase?tier=nonsnack",
    },
    {
      id: "business",
      variant: "business" as const,
      title: t("businessTitle"),
      price: "$99",
      description: t("businessDescription"),
      features: [t("businessFeatures.0"), t("businessFeatures.1"), t("businessFeatures.2")],
      ctaLabel: t("businessCta"),
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
      <section className="relative overflow-hidden pt-8 pb-10 lg:pt-10 lg:pb-12">
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
                className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)]"
              >
                {t("ctaPrimary")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TIERS — core product decision ── */}
      <section id="tiers" className="pt-8 pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
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
      <section id="styles" className="border-t border-[var(--border)] bg-[var(--surface-soft)] py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
              {t("stylesLabel")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("stylesTitle")}
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {styleCards.map((card) => (
              <article key={card.title} className={`overflow-hidden rounded-2xl border shadow-sm ${card.accent}`}>
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
                    className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand-dark)] transition hover:bg-sky-50"
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
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
              {t("faqLabel")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              {t("faqTitle")}
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
            >
              {t("faqAllLink")} →
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* ── 5. FINAL CTA ── */}
      <section id="join" className="pb-16 pt-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-xl border border-sky-900/30 bg-[var(--brand-dark)] px-8 py-12 text-white sm:px-12">
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{t("joinTitle")}</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-sky-100/90">{t("joinText")}</p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <LocalizedLink
                href="/purchase?tier=protected"
                className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)]"
              >
                {t("joinCtaPrimary")}
              </LocalizedLink>
              <LocalizedLink
                href="/purchase?tier=nonsnack"
                className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-white/30 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10"
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
