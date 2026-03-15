import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { setRequestLocale } from "next-intl/server";
import { ProtectedFriendContent } from "@/components/membership/protected-friend-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProtectedFriendStatusPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main>
        <ProtectedFriendContent />
      </main>
      <SiteFooter />
    </>
  );
}
