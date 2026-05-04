import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { WantedContent } from "@/components/wanted/wanted-content";
import { BASE_URL } from "@/lib/config";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.wanted" });
  const otherLocale = locale === "en" ? "es" : "en";
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/wanted`,
      languages: {
        [locale]: `/${locale}/wanted`,
        [otherLocale]: `/${otherLocale}/wanted`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      // Dedicated wanted-poster sample (Dave from Accounting). When the URL
      // is shared, the link preview shows the actual product instead of the
      // generic homepage plushies.
      images: [
        { url: "/og/wanted-sample.png", width: 1200, height: 630 },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og/wanted-sample.png"],
    },
  };
}

export default async function WantedPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-20 md:pb-0">
        <WantedContent />
      </main>
      <SiteFooter />
    </>
  );
}
