import { headers } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getMemberByPublicIdentifier, type Member } from "@/lib/members";
import {
  getDemoMemberByPublicIdentifier,
  shouldUseDemoMembers,
} from "@/lib/demo-members";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VerifyContent } from "@/components/verify/verify-content";
import { VerifyLookupContent } from "@/components/verify/verify-lookup-content";
import { VerifySampleContent } from "@/components/verify/verify-sample-content";
import { getRateLimitKey, takeRateLimit } from "@/lib/rate-limit";
import { formatRegistryIdForDisplay } from "@/lib/registry-id";
import { BASE_URL } from "@/lib/config";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string; code?: string; ref?: string }>;
};

function getDaysOnFile(issueDate: string) {
  const issuedAt = new Date(issueDate).getTime();
  if (!Number.isFinite(issuedAt)) return 0;
  return Math.max(0, Math.floor((Date.now() - issuedAt) / 86_400_000));
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const { id, code } = await searchParams;
  const publicIdentifier = code || id;

  if (publicIdentifier && publicIdentifier !== "sample") {
    let member: Member | null = null;
    try {
      member = await getMemberByPublicIdentifier(publicIdentifier);
    } catch (error) {
      if (!shouldUseDemoMembers()) {
        throw error;
      }
    }

    if (!member && shouldUseDemoMembers()) {
      member = getDemoMemberByPublicIdentifier(publicIdentifier);
    }

    if (member?.registryVisibility === "public" && !member.erasedAt) {
      const registryId = member.registryCode || formatRegistryIdForDisplay(member.id);
      const ogParams = new URLSearchParams({
        name: member.name,
        tier: member.tier,
        code: registryId,
        locale,
      });
      const imageUrl = `${BASE_URL}/og/certificate?${ogParams.toString()}`;
      const title = `${member.name} - Verified Shark Human Alliance certificate`;
      const description =
        "A verified Shark Human Alliance certificate record. Symbolic paperwork, real shark conservation allocation.";

      return {
        title,
        description,
        robots: { index: false, follow: false },
        openGraph: {
          title,
          description,
          images: [{ url: imageUrl, width: 1200, height: 630 }],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [imageUrl],
        },
      };
    }
  }

  return {
    title: "Verify Alliance Membership",
    description:
      "Verify the authenticity of a Shark Human Alliance membership certificate.",
    robots: { index: false, follow: false },
  };
}

export default async function VerifyPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { id, code, ref } = await searchParams;
  const publicIdentifier = code || id;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "verify" });

  function renderLookup(reason: "missing" | "notFound" | "private") {
    return (
      <>
        <SiteHeader />
        <main id="main">
          <VerifyLookupContent reason={reason} />
        </main>
        <SiteFooter />
      </>
    );
  }

  if (!publicIdentifier) return renderLookup("missing");

  // Sample certificate preview — not a real member
  if (publicIdentifier === "sample") {
    return (
      <>
        <SiteHeader />
        <main id="main">
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
        <main id="main" className="pt-16">
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
    member = await getMemberByPublicIdentifier(publicIdentifier);
  } catch (error) {
    if (!shouldUseDemoMembers()) {
      throw error;
    }
  }

  if (!member && shouldUseDemoMembers()) {
    member = getDemoMemberByPublicIdentifier(publicIdentifier);
  }

  if (!member) return renderLookup("notFound");
  if (member.registryVisibility !== "public" || member.erasedAt) {
    return renderLookup("private");
  }

  const displayDate = new Date(member.date).toLocaleDateString(
    locale === "es" ? "es-ES" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );
  const daysOnFile = getDaysOnFile(member.date);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <VerifyContent
          name={member.name}
          tier={member.tier}
          date={displayDate}
          daysOnFile={daysOnFile}
          registryId={member.registryCode || formatRegistryIdForDisplay(member.id)}
          referralCode={member.referralCode}
          referralCount={member.referralCount}
          referralSourceCode={ref || member.referralCode}
        />
      </main>
      <SiteFooter />
    </>
  );
}
