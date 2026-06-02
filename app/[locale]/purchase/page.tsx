import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PurchaseFlow } from "@/components/purchase/purchase-flow";
import { BASE_URL } from "@/lib/config";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
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

export default async function PurchasePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "purchase" });

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-col pb-12 md:pb-0">
        <section className="order-2 border-b border-[var(--border)] bg-[var(--surface-soft)]/55 py-6 lg:order-1 lg:py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--section-label)]">
                  {t("seoSummary.eyebrow")}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-2xl lg:text-3xl">
                  {t("seoSummary.title")}
                </h2>
                <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-[var(--brand-dark)] sm:text-base sm:leading-7">
                  {t("seoSummary.coffeeNote")}
                </p>
                <p className="mt-2 max-w-3xl text-xs font-medium leading-5 text-[var(--muted)] sm:text-sm sm:leading-6">
                  {t("seoSummary.realityNote")}
                </p>
              </div>

              <details className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm lg:hidden">
                <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-[var(--brand-dark)]">
                  <span>{t("seoSummary.mobileSummaryToggle")}</span>
                  <span aria-hidden="true">+</span>
                </summary>
                <ul className="space-y-2 border-t border-[var(--border)] px-4 py-4 text-sm leading-6 text-[var(--brand-dark)]">
                  {[0, 1, 2, 3].map((index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span>{t(`seoSummary.includes.${index}`)}</span>
                    </li>
                  ))}
                </ul>
              </details>

              <div className="hidden rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm lg:block">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--section-label)]">
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
          </div>
        </section>
        <div className="order-1 lg:order-2">
          <PurchaseFlow />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
