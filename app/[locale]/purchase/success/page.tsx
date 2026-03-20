import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SuccessContent } from "@/components/purchase/success-content";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.purchaseSuccess" });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export default async function PurchaseSuccessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-20 md:pb-0">
        <SuccessContent />
      </main>
      <SiteFooter />
    </>
  );
}
