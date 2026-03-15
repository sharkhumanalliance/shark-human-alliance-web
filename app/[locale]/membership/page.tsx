import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { setRequestLocale } from "next-intl/server";
import { MembershipPageContent } from "@/components/membership/membership-page-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MembershipPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main>
        <MembershipPageContent />
      </main>
      <SiteFooter />
    </>
  );
}
