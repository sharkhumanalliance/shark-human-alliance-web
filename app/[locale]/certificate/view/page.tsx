import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CertificateDocument, type CertificateTemplate } from "@/components/certificate/certificate-document";
import { getMemberByAccessToken } from "@/lib/members";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; template?: string }>;
};

export default async function CertificateViewPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token, template: templateParam } = await searchParams;
  setRequestLocale(locale);

  if (!token) notFound();

  const member = await getMemberByAccessToken(token);
  if (!member) notFound();

  // Query param overrides DB value; DB value overrides default "hero".
  const validTemplates: CertificateTemplate[] = ["hero", "formal", "luxury"];
  const template: CertificateTemplate =
    validTemplates.includes(templateParam as CertificateTemplate)
      ? (templateParam as CertificateTemplate)
      : validTemplates.includes(member.template as CertificateTemplate)
        ? (member.template as CertificateTemplate)
        : "hero";

  const displayDate = new Date(member.date).toLocaleDateString(
    locale === "es" ? "es-ES" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <main className="flex min-h-screen items-start justify-center bg-white print:block">
      <CertificateDocument
        name={member.name}
        tier={member.tier}
        dedication={member.dedication}
        date={displayDate}
        registryId={member.id.toUpperCase()}
        priorityImages
        template={template}
      />
    </main>
  );
}
