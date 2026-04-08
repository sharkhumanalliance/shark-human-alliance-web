import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ImpactContent } from "@/components/impact/impact-content";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.impact" });
  const otherLocale = locale === "en" ? "es" : "en";
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `https://sharkhumanalliance.com/${locale}/impact`,
      languages: {
        [locale]: `/${locale}/impact`,
        [otherLocale]: `/${otherLocale}/impact`,
      },
    },
    openGraph: { title: t("title"), description: t("description"), type: "website", images: [{ url: "/mascots/finnley-luna-hero-v2.webp", width: 1536, height: 1024 }] },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description"), images: ["/mascots/finnley-luna-hero-v2.webp"] },
  };
}

export default async function ImpactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-20 md:pb-0">
        <ImpactContent />
      </main>
      <SiteFooter />
    </>
  );
}
