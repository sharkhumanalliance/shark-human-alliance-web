import { HeroSection } from "@/components/home/hero-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MobileStickyCta } from "@/components/mobile-sticky-cta";
import { setRequestLocale } from "next-intl/server";
import { HomeContent } from "@/components/home/home-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main className="pb-16 md:pb-0">
        <HeroSection />
        <HomeContent />
      </main>
      <SiteFooter />
      <MobileStickyCta />
    </>
  );
}
