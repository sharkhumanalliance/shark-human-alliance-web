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
import { CertificateDownloadControls } from "@/components/certificate/certificate-download-controls";
import { CertificatePrintTrigger } from "@/components/certificate/certificate-print-trigger";
import { RouteMessages } from "@/components/route-messages";
import { getMemberByAccessToken } from "@/lib/members";
import { getDevPromoMemberByAccessToken } from "@/lib/dev-promo-store";
import { getPublicTierKey } from "@/lib/tiers";
import {
  isPaperFormatAvailableForTemplate,
  normalizePaperFormatForTemplate,
} from "@/lib/certificate-paper";
import { formatRegistryIdForDisplay } from "@/lib/registry-id";

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

  const paperFormat: PaperFormat = normalizePaperFormatForTemplate(
    template,
    paper,
  );
  const autoPrint = download === "1";
  const publicTier = getPublicTierKey(member.tier);
  const useNativePaperLayout =
    paperFormat === "letter" &&
    (template === "playful" ||
      (template === "luxury" &&
        (publicTier === "protected" ||
          publicTier === "nonsnack" ||
          publicTier === "business")));

  const displayDate = new Date(member.date).toLocaleDateString(
    locale === "es" ? "es-ES" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const pageSizeCss = paperFormat === "letter" ? "Letter portrait" : "A4 portrait";
  const buildPaperHref = (nextPaper: PaperFormat) => {
    const params = new URLSearchParams({
      token,
      template,
      paper: nextPaper,
    });
    return `/certificate/view?${params.toString()}`;
  };

  return (
    <RouteMessages route="certificateView">
    <main className="min-h-screen bg-white px-4 py-6 print:block print:bg-white print:p-0">
      <CertificatePrintTrigger enabled={autoPrint} />
      <style media="print">{`@page { size: ${pageSizeCss}; margin: 0; }`}</style>
      <CertificateDownloadControls
        paperFormat={paperFormat}
        a4Href={buildPaperHref("a4")}
        letterHref={buildPaperHref("letter")}
        isLetterAvailable={isPaperFormatAvailableForTemplate(template, "letter")}
      />
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
            registryId={member.registryCode || formatRegistryIdForDisplay(member.id)}
            referralCode={member.referralCode}
            accessToken={token}
            priorityImages
            template={template}
            paperFormat={paperFormat}
            locale={locale}
            issueNumber={member.issueNumber}
          />
        </CertificateSheet>
      </div>
      <CertificateAccessPanel
        token={token}
        initialRegistryVisibility={member.registryVisibility}
      />
    </main>
    </RouteMessages>
  );
}
