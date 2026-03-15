import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { setRequestLocale } from "next-intl/server";
import { RegistryContent } from "@/components/registry/registry-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RegistryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main>
        <RegistryContent />
      </main>
      <SiteFooter />
    </>
  );
}
