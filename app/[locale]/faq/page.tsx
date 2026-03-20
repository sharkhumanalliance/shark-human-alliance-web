import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { FaqContent } from "@/components/faq/faq-content";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.faq" });
  const otherLocale = locale === "en" ? "es" : "en";
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `https://sharkhumanalliance.com/${locale}/faq`,
      languages: {
        [locale]: `/${locale}/faq`,
        [otherLocale]: `/${otherLocale}/faq`,
      },
    },
    openGraph: { title: t("title"), description: t("description"), type: "website", images: [{ url: "/mascots/finnley-luna-hero.png", width: 1400, height: 1100 }] },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description"), images: ["/mascots/finnley-luna-hero.png"] },
  };
}

async function FaqJsonLd({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "faqPage" });
  const items = Array.from({ length: 8 }, (_, i) => ({
    "@type": "Question" as const,
    name: t(`items.${i}.question`),
    acceptedAnswer: {
      "@type": "Answer" as const,
      text: t(`items.${i}.answer`),
    },
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <FaqJsonLd locale={locale} />
      <SiteHeader />
      <main id="main" className="pb-20 md:pb-0">
        <FaqContent />
      </main>
      <SiteFooter />
    </>
  );
}
