import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CertificateDocument, type CertificateTemplate } from "@/components/certificate/certificate-document";
import { CertificateSheet, type PaperFormat } from "@/components/certificate/certificate-sheet";
import { getMemberByAccessToken } from "@/lib/members";
import { getDevPromoMemberByAccessToken } from "@/lib/dev-promo-store";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; template?: string; paper?: string }>;
};

export default async function CertificateViewPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token, template: templateParam, paper } = await searchParams;
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
  const validTemplates: CertificateTemplate[] = ["hero", "formal", "luxury"];
  const template: CertificateTemplate =
    validTemplates.includes(templateParam as CertificateTemplate)
      ? (templateParam as CertificateTemplate)
      : validTemplates.includes(member.template as CertificateTemplate)
        ? (member.template as CertificateTemplate)
        : "luxury";

  const paperFormat: PaperFormat = paper === "letter" ? "letter" : "a4";

  const displayDate = new Date(member.date).toLocaleDateString(
    locale === "es" ? "es-ES" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const pageSizeCss = paperFormat === "letter" ? "Letter portrait" : "A4 portrait";

  return (
    <main className="flex min-h-screen items-start justify-center bg-white px-4 py-6 print:block print:bg-white print:p-0">
      <style media="print">{`@page { size: ${pageSizeCss}; margin: 0; }`}</style>
      <CertificateSheet paperFormat={paperFormat}>
        <CertificateDocument
          name={member.name}
          tier={member.tier}
          dedication={member.dedication}
          date={displayDate}
          registryId={member.id.toUpperCase()}
          referralCode={member.referralCode}
          priorityImages
          template={template}
        />
      </CertificateSheet>
    </main>
  );
}
