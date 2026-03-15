import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { setRequestLocale } from "next-intl/server";
import { PurchaseFlow } from "@/components/purchase/purchase-flow";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PurchasePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main>
        <PurchaseFlow />
      </main>
      <SiteFooter />
    </>
  );
}
