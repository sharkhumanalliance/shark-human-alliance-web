import { HeroSection } from "@/components/home/hero-section";
import { MembershipCard } from "@/components/home/membership-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
      <main>
        <HeroSection />
        <HomeContent />
      </main>
      <SiteFooter />
    </>
  );
}
