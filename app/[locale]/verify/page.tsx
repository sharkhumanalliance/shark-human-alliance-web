import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getMemberById } from "@/lib/members";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VerifyContent } from "@/components/verify/verify-content";
import { VerifySampleContent } from "@/components/verify/verify-sample-content";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string; ref?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Verify Alliance Membership — Shark Human Alliance",
    description:
      "Verify the authenticity of a Shark Human Alliance membership certificate.",
    robots: { index: false, follow: false },
  };
}

export default async function VerifyPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { id, ref } = await searchParams;
  setRequestLocale(locale);

  if (!id) notFound();

  // Sample certificate preview — not a real member
  if (id === "sample") {
    return (
      <>
        <SiteHeader />
        <main id="main" className="pb-20 md:pb-0">
          <VerifySampleContent />
        </main>
        <SiteFooter />
      </>
    );
  }

  const member = await getMemberById(id);
  if (!member) notFound();

  const displayDate = new Date(member.date).toLocaleDateString(
    locale === "es" ? "es-ES" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-20 md:pb-0">
        <VerifyContent
          name={member.name}
          tier={member.tier}
          date={displayDate}
          registryId={member.id.toUpperCase()}
          referralCode={member.referralCode}
          referralCount={member.referralCount}
          referralSourceCode={ref || member.referralCode}
        />
      </main>
      <SiteFooter />
    </>
  );
}
