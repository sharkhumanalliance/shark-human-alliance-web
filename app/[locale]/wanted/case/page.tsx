import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WantedCaseContent } from "@/components/wanted/wanted-case-content";
import { BASE_URL } from "@/lib/config";
import { formatCertificateDate } from "@/lib/dates";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ name?: string; tone?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.wantedCase" });
  const otherLocale = locale === "en" ? "es" : "en";

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/wanted/case`,
      languages: {
        [locale]: `/${locale}/wanted/case`,
        [otherLocale]: `/${otherLocale}/wanted/case`,
      },
    },
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
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

export default async function WantedCasePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-16 md:pb-0">
        <WantedCaseContent
          initialName={resolvedSearchParams?.name}
          initialTone={resolvedSearchParams?.tone}
          certificateDate={formatCertificateDate(new Date(), locale)}
        />
      </main>
      <SiteFooter />
    </>
  );
}
