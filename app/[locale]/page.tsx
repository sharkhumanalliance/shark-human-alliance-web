import { HeroSection } from "@/components/home/hero-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RouteMessages } from "@/components/route-messages";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { HomeContent } from "@/components/home/home-content";
import { MobileStickyCta } from "@/components/home/mobile-sticky-cta";
import { localizedAlternates } from "@/lib/seo";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.home" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localizedAlternates(locale),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      images: [{ url: "/mascots/homepage-hero-og-certificate.jpg", width: 1200, height: 630, alt: "Finnley and Luna presenting a Shark Human Alliance certificate" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/mascots/homepage-hero-og-certificate.jpg"],
    },
  };
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RouteMessages route="home">
      <SiteHeader />
      <main id="main">
        <HeroSection />
        <HomeContent />
      </main>
      <SiteFooter />
      <MobileStickyCta />
    </RouteMessages>
  );
}
