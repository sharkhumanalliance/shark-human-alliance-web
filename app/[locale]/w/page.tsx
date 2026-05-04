import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    n?: string;
    name?: string;
    t?: string;
    tone?: string;
  }>;
};

export default async function WantedShortLinkPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const name = resolvedSearchParams?.n || resolvedSearchParams?.name || "";
  const tone = resolvedSearchParams?.t || resolvedSearchParams?.tone || "clear";
  const targetParams = new URLSearchParams({ tone });

  if (name.trim()) {
    targetParams.set("name", name.trim());
  }

  redirect(`/${locale}/wanted/case?${targetParams.toString()}`);
}
