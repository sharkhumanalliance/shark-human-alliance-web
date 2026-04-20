import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { MembershipPageContent } from "@/components/membership/membership-page-content";
import { BASE_URL } from "@/lib/config";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.membership" });
  const otherLocale = locale === "en" ? "es" : "en";
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/membership`,
      languages: {
        [locale]: `/${locale}/membership`,
        [otherLocale]: `/${otherLocale}/membership`,
      },
    },
    openGraph: { title: t("title"), description: t("description"), type: "website", images: [{ url: "/mascots/homepage-hero-plush.png", width: 1152, height: 768 }] },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description"), images: ["/mascots/homepage-hero-plush.png"] },
  };
}

export default async function MembershipPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-20 md:pb-0">
        <MembershipPageContent />
      </main>
      <SiteFooter />
    </>
  );
}
