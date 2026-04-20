import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getMemberById, type Member } from "@/lib/members";
import { getDemoMemberById, shouldUseDemoMembers } from "@/lib/demo-members";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VerifyContent } from "@/components/verify/verify-content";
import { VerifySampleContent } from "@/components/verify/verify-sample-content";
import { getRateLimitKey, takeRateLimit } from "@/lib/rate-limit";
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
  const t = await getTranslations({ locale, namespace: "verify" });

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

  const headersList = await headers();
  const rateLimit = takeRateLimit(
    getRateLimitKey(headersList.get("x-forwarded-for")?.split(",")[0]?.trim(), "verify-page"),
    30,
    60_000
  );

  if (!rateLimit.allowed) {
    return (
      <>
        <SiteHeader />
        <main id="main" className="pb-20 pt-16 md:pb-0">
          <section className="mx-auto max-w-xl px-4 text-center sm:px-6">
            <h1 className="text-2xl font-semibold text-[var(--brand-dark)]">
              {t("rateLimitedTitle")}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {t("rateLimitedText")}
            </p>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  let member: Member | null = null;

  try {
    member = await getMemberById(id);
  } catch (error) {
    if (!shouldUseDemoMembers()) {
      throw error;
    }
  }

  if (!member && shouldUseDemoMembers()) {
    member = getDemoMemberById(id);
  }

  if (!member) notFound();
  if (member.registryVisibility !== "public" || member.erasedAt) notFound();

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
