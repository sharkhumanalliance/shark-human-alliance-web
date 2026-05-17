import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { NotFoundContent } from "@/components/not-found-content";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-20 md:pb-0">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </>
  );
}
