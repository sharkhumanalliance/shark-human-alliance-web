import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WantedCaseContent } from "@/components/wanted/wanted-case-content";
import { BASE_URL } from "@/lib/config";
import { formatCertificateDate } from "@/lib/dates";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ name?: string; tone?: string; by?: string }>;
};

const ALLOWED_TONES = ["mild", "clear", "emergency"] as const;
type AllowedTone = (typeof ALLOWED_TONES)[number];

function normalizeTone(raw: string | undefined): AllowedTone {
  return (ALLOWED_TONES as readonly string[]).includes(raw ?? "")
    ? (raw as AllowedTone)
    : "clear";
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const resolved = await searchParams;
  const t = await getTranslations({ locale, namespace: "seo.wantedCase" });
  const otherLocale = locale === "en" ? "es" : "en";

  // Personalized OG: pulls the actual name + tone from the share URL so the
  // preview shows the accused human, not a generic placeholder.
  const name = (resolved?.name ?? "").trim();
  const tone = normalizeTone(resolved?.tone);
  const ogParams = new URLSearchParams({ tone, locale });
  if (name) ogParams.set("name", name);
  const ogUrl = `${BASE_URL}/og/wanted?${ogParams.toString()}`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/wanted/case`,
      languages: {
        [locale]: `/${locale}/wanted/case`,
        [otherLocale]: `/${otherLocale}/wanted/case`,
      },
    },
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      images: [
        { url: ogUrl, width: 1200, height: 630 },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [ogUrl],
    },
  };
}

export default async function WantedCasePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-16 md:pb-0">
        <WantedCaseContent
          initialName={resolvedSearchParams?.name}
          initialTone={resolvedSearchParams?.tone}
          initialBy={resolvedSearchParams?.by}
          certificateDate={formatCertificateDate(new Date(), locale)}
        />
      </main>
      <SiteFooter />
    </>
  );
}
