import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { GiftRevealContent } from "@/components/gift/gift-reveal-content";
import { BASE_URL } from "@/lib/config";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    to?: string;
    from?: string;
    msg?: string;
    token?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "giftReveal" });
  const otherLocale = locale === "en" ? "es" : "en";

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/gift`,
      languages: {
        [locale]: `/${locale}/gift`,
        [otherLocale]: `/${otherLocale}/gift`,
      },
    },
    // Personalized gift links are private; keep them out of search indexes.
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function GiftRevealPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolved = await searchParams;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-16 md:pb-0">
        <GiftRevealContent
          to={resolved?.to}
          from={resolved?.from}
          message={resolved?.msg}
          token={resolved?.token}
        />
      </main>
      <SiteFooter />
    </>
  );
}
