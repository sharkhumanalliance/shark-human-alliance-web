import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PurchaseFlow } from "@/components/purchase/purchase-flow";
import { BASE_URL } from "@/lib/config";
import {
  getTierMetadata,
  getTierPriceLabel,
  normalizeTier,
} from "@/lib/tiers";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ tier?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.purchase" });
  const otherLocale = locale === "en" ? "es" : "en";
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/purchase`,
      languages: {
        [locale]: `/${locale}/purchase`,
        [otherLocale]: `/${otherLocale}/purchase`,
      },
    },
    openGraph: { title: t("title"), description: t("description"), type: "website", images: [{ url: "/mascots/homepage-hero-plush.png", width: 1152, height: 768 }] },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description"), images: ["/mascots/homepage-hero-plush.png"] },
  };
}

export default async function PurchasePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "purchase" });
  const selectedTier = normalizeTier(resolvedSearchParams?.tier);
  const tierMetadata = getTierMetadata(selectedTier);
  const tierLabel = t(`tiers.${tierMetadata.labelKey}`);
  const donationLabel = `$${tierMetadata.donationCents / 100}`;

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-12 md:pb-0">
        <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]/55 py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--section-label)]">
                  {t("seoSummary.eyebrow")}
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-3xl">
                  {t("seoSummary.title", { tier: tierLabel })}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">
                  {t("seoSummary.description", {
                    price: getTierPriceLabel(selectedTier),
                    donation: donationLabel,
                  })}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("seoSummary.includesLabel")}
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--brand-dark)]">
                  {[0, 1, 2, 3].map((index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span>{t(`seoSummary.includes.${index}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--muted)]">
              {t("seoSummary.legalPrefix")}{" "}
              <a href={`/${locale}/terms`} className="font-semibold text-[var(--brand-dark)] underline underline-offset-2">
                {t("seoSummary.termsLink")}
              </a>
              {", "}
              <a href={`/${locale}/privacy`} className="font-semibold text-[var(--brand-dark)] underline underline-offset-2">
                {t("seoSummary.privacyLink")}
              </a>
              {", "}
              <a href={`/${locale}/terms#refunds`} className="font-semibold text-[var(--brand-dark)] underline underline-offset-2">
                {t("seoSummary.refundLink")}
              </a>
              .
            </div>
          </div>
        </section>
        <PurchaseFlow />
      </main>
      <SiteFooter />
    </>
  );
}
