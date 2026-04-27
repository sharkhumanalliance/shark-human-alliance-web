import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  CertificateDocument,
  isAcceptedCertificateTemplate,
  type CertificateTemplate,
  normalizeTemplate,
} from "@/components/certificate/certificate-document";
import { CertificateSheet, type PaperFormat } from "@/components/certificate/certificate-sheet";
import { CertificateAccessPanel } from "@/components/certificate/certificate-access-panel";
import { CertificatePrintTrigger } from "@/components/certificate/certificate-print-trigger";
import { getMemberByAccessToken } from "@/lib/members";
import { getDevPromoMemberByAccessToken } from "@/lib/dev-promo-store";
import { getPublicTierKey } from "@/lib/tiers";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    token?: string;
    template?: string;
    paper?: string;
    download?: string;
  }>;
};

export default async function CertificateViewPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token, template: templateParam, paper, download } = await searchParams;
  setRequestLocale(locale);

  if (!token) notFound();

  let member = null;
  try {
    member = await getMemberByAccessToken(token);
  } catch {
    member = null;
  }

  if (!member) {
    member = getDevPromoMemberByAccessToken(token);
  }
  if (!member) notFound();

  // Query param overrides DB value; DB value overrides default "luxury".
  const template: CertificateTemplate = isAcceptedCertificateTemplate(templateParam)
    ? normalizeTemplate(templateParam)
    : isAcceptedCertificateTemplate(member.template)
      ? normalizeTemplate(member.template)
      : "luxury";

  const paperFormat: PaperFormat = paper === "letter" ? "letter" : "a4";
  const autoPrint = download === "1";
  const publicTier = getPublicTierKey(member.tier);
  const useNativePaperLayout =
    paperFormat === "letter" &&
    (template === "playful" || (template === "luxury" && publicTier === "protected"));

  const displayDate = new Date(member.date).toLocaleDateString(
    locale === "es" ? "es-ES" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const pageSizeCss = paperFormat === "letter" ? "Letter portrait" : "A4 portrait";

  return (
    <main className="min-h-screen bg-white px-4 py-6 print:block print:bg-white print:p-0">
      <CertificatePrintTrigger enabled={autoPrint} />
      <style media="print">{`@page { size: ${pageSizeCss}; margin: 0; }`}</style>
      <div className="flex items-start justify-center">
        <CertificateSheet
          paperFormat={paperFormat}
          useNativePaperLayout={useNativePaperLayout}
        >
          <CertificateDocument
            name={member.name}
            tier={member.tier}
            dedication={member.dedication}
            date={displayDate}
            registryId={member.id.toUpperCase()}
            referralCode={member.referralCode}
            priorityImages
            template={template}
            paperFormat={paperFormat}
            locale={locale}
          />
        </CertificateSheet>
      </div>
      <CertificateAccessPanel
        token={token}
        initialRegistryVisibility={member.registryVisibility}
      />
    </main>
  );
}
