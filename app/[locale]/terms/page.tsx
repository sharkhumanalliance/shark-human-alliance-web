import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.terms" });
  const otherLocale = locale === "en" ? "es" : "en";

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `https://sharkhumanalliance.com/${locale}/terms`,
      languages: {
        [locale]: `/${locale}/terms`,
        [otherLocale]: `/${otherLocale}/terms`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      images: [{ url: "/mascots/finnley-luna-hero.webp", width: 1400, height: 1100 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/mascots/finnley-luna-hero.webp"],
    },
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "termsPage" });

  const sections = [
    "operator",
    "products",
    "ordering",
    "delivery",
    "complaints",
    "refunds",
    "contact",
  ] as const;

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-20 md:pb-0">
        <section className="bg-white py-14 lg:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
              {t("eyebrow")}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              {t("intro")}
            </p>
            <p className="mt-4 text-sm text-[var(--muted)]">
              <span className="font-medium text-[var(--brand-dark)]">{t("updatedLabel")}:</span> {t("updatedValue")}
            </p>
          </div>
        </section>

        <section className="bg-[var(--surface-soft)] py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-6">
            <div className="space-y-5">
              {sections.map((section) => (
                <article key={section} className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-7">
                  <h2 className="text-xl font-semibold text-[var(--brand-dark)] sm:text-2xl">
                    {t(`sections.${section}.title`)}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
                    {t(`sections.${section}.body`)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
