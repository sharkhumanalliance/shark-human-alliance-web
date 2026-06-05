import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RouteMessages } from "@/components/route-messages";
import {
  GiftRevealContent,
  type GiftCertificate,
} from "@/components/gift/gift-reveal-content";
import { localizedAlternates } from "@/lib/seo";
import { getMemberByAccessToken } from "@/lib/members";
import { normalizeTemplate } from "@/lib/certificate-templates";
import { formatCertificateDate } from "@/lib/dates";
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

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localizedAlternates(locale, "/gift"),
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

  // When a valid access token is present, load the real certificate so the
  // reveal shows the actual personalized document instead of a placeholder.
  const token = (resolved?.token ?? "")
    .replace(/[^a-fA-F0-9]/g, "")
    .slice(0, 128);
  let certificate: GiftCertificate | undefined;
  if (token) {
    try {
      const member = await getMemberByAccessToken(token);
      if (member) {
        certificate = {
          name: member.name,
          tier: member.tier,
          dedication: member.dedication ?? "",
          date: formatCertificateDate(new Date(member.date), locale),
          registryId: member.registryCode || "",
          template: normalizeTemplate(member.template),
        };
      }
    } catch {
      // DB unavailable / demo mode — fall back to the placeholder reveal.
      certificate = undefined;
    }
  }

  return (
    <RouteMessages route="gift">
      <SiteHeader />
      <main id="main" className="pb-16 md:pb-0">
        <GiftRevealContent
          to={resolved?.to}
          from={resolved?.from}
          message={resolved?.msg}
          token={resolved?.token}
          certificate={certificate}
        />
      </main>
      <SiteFooter />
    </RouteMessages>
  );
}
