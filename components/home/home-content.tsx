"use client";

import { useTranslations } from "next-intl";
import { MembershipCard } from "./membership-card";
import { CertificatePreview } from "@/components/certificate/certificate-preview";

export function HomeContent() {
  const t = useTranslations("home");

  const faqItems = Array.from({ length: 6 }, (_, i) => ({
    question: t(`faq.items.${i}.question`),
    answer: t(`faq.items.${i}.answer`),
  }));

  const reviews = Array.from({ length: 5 }, (_, i) => ({
    text: t(`reviews.items.${i}.text`),
    author: t(`reviews.items.${i}.author`),
    role: t(`reviews.items.${i}.role`),
  }));

  return (
    <>
      {/* Reviews — social proof right after hero */}
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
                <div className="flex gap-1 text-orange-400">
                  {"★★★★★".split("").map((star, j) => (
                    <span key={j} className="text-lg">{star}</span>
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

      {/* Perfect for gifting */}
      <section className="py-12">
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
              <div key={i} className="rounded-[2rem] border border-sky-100 bg-white p-6 text-center shadow-[0_16px_50px_rgba(25,87,138,0.08)]">
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
        </div>
      </section>

      {/* Certificate Preview — full width showcase */}
      <section id="certificate-preview" className="py-12 bg-gradient-to-b from-sky-50/50 to-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("about.certPreviewLabel")}
            </p>
          </div>

          <div className="mt-8 mx-auto max-w-2xl">
            <CertificatePreview
              name={t("about.certName")}
              tier="protected"
              date={new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              registryId="SHA-XXXX"
              t={{
                header: "SHARK HUMAN ALLIANCE",
                subtitle: "Office of Interspecies Diplomatic Affairs",
                certTitle: t("about.certTitle"),
                certifies: t("about.certCertifies"),
                statusLabel: "has been granted the status of",
                tierName: "Protected Friend",
                body: t("about.certText"),
                dedicationLabel: "",
                dateLabel: "Date",
                registryIdLabel: "Registry ID",
                seal: "OFFICIAL SEAL",
                footer: "Approved by the Department of Symbolic Marine Affairs. No sharks were harmed or consulted in the making of this document.",
              }}
            />
          </div>

          <div className="mt-8 text-center">
            <a
              href="/purchase?tier=protected"
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)]"
            >
              {t("membershipSection.protectedCta")}
            </a>
          </div>
        </div>
      </section>

      {/* Membership — dark section for contrast */}
      <section id="membership" className="py-14 bg-[var(--brand-dark)]">
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

      {/* Dramatic Stats */}
      <section className="py-14 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-5xl font-bold text-[var(--brand-dark)] md:text-6xl">{t("realImpact.stat1Value")}</p>
              <p className="mt-3 text-sm leading-5 text-[var(--muted)]">{t("realImpact.stat1Label")}</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-[var(--accent)] md:text-6xl">{t("realImpact.stat2Value")}</p>
              <p className="mt-3 text-sm leading-5 text-[var(--muted)]">{t("realImpact.stat2Label")}</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-[var(--brand-dark)] md:text-6xl">{t("realImpact.stat3Value")}</p>
              <p className="mt-3 text-sm leading-5 text-[var(--muted)]">{t("realImpact.stat3Label")}</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-teal-600 md:text-6xl">{t("realImpact.stat4Value")}</p>
              <p className="mt-3 text-sm leading-5 text-[var(--muted)]">{t("realImpact.stat4Label")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Impact — moved down */}
      <section id="real-impact" className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              {t("realImpact.label")}
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("realImpact.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              {t("realImpact.description")}
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
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

          {/* Transparency + Legal inline */}
          <div className="mt-8 rounded-[2rem] border border-sky-100 bg-[var(--surface-soft)] p-8">
            <p className="text-sm leading-7 text-[var(--muted)]">
              {t("realImpact.transparencyNote")}
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {t("realImpact.legalNote")}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              {t("faq.label")}
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
              {t("faq.title")}
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]"
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
