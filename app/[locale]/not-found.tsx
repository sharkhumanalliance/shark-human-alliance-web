import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { NotFoundContent } from "@/components/not-found-content";
import { RouteMessages } from "@/components/route-messages";

export default function NotFound() {
  return (
    <RouteMessages route="notFound">
      <SiteHeader />
      <main id="main" className="pb-20 md:pb-0">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </RouteMessages>
  );
}
