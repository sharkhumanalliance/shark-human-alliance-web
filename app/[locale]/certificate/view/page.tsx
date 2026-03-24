import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CertificateDocument, type CertificateTemplate } from "@/components/certificate/certificate-document";
import { readMembers } from "@/lib/members";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; template?: string }>;
};

export default async function CertificateViewPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token, template: templateParam } = await searchParams;
  setRequestLocale(locale);

  if (!token) notFound();

  const template: CertificateTemplate =
    templateParam === "formal" ? "formal" : "hero";

  // Look up member by accessToken
  const members = await readMembers();
  const member = members.find((m) => m.accessToken === token);
  if (!member) notFound();

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
