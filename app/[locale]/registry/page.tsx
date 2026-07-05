import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RouteMessages } from "@/components/route-messages";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { RegistryContent } from "@/components/registry/registry-content";
import { localizedAlternates } from "@/lib/seo";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.registry" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localizedAlternates(locale, "/registry"),
    openGraph: { title: t("title"), description: t("description"), type: "website", images: [{ url: "/mascots/homepage-hero-og.jpg", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description"), images: ["/mascots/homepage-hero-og.jpg"] },
  };
}

export default async function RegistryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RouteMessages route="registry">
      <SiteHeader />
      <main id="main" className="pb-20 md:pb-0">
        <RegistryContent />
      </main>
      <SiteFooter />
    </RouteMessages>
  );
}
