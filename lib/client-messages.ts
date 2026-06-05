import type { AbstractIntlMessages } from "next-intl";

/**
 * Per-route trimming of the message catalog shipped to the browser.
 *
 * `getMessages()` server-side always has the full catalog; what we pass to
 * <NextIntlClientProvider> is what gets serialized into the RSC/hydration
 * payload. Server components (getTranslations) are unaffected, so we only ship
 * the namespaces a given route's CLIENT components actually consume.
 *
 * BASE = namespaces used by chrome present on (almost) every page: the header,
 * footer, cookie banner and the a11y skip link. The root layout provider ships
 * BASE as a safety net (covers CookieConsent + any page without its own
 * RouteMessages wrapper). Each non-trivial route then re-declares BASE + its
 * own namespaces via <RouteMessages>, because use-intl (v4) REPLACES messages
 * in a nested provider rather than merging with the parent.
 *
 * The route sets below were derived by statically tracing each page's client
 * component import graph and collecting every useTranslations("…") namespace.
 * RULE: if you add a client namespace to a route's component tree, add it here,
 * or that string renders as the raw key at runtime. Re-derive with the import
 * graph walk in scripts (see commit history) or:
 *   grep -rhoE 'useTranslations\("[^"]*"\)' components app | sort -u
 */
export const BASE_CLIENT_NAMESPACES = [
  "accessibility",
  "header",
  "footer",
  "cookies",
] as const;

const withBase = (...extra: string[]): readonly string[] => [
  ...BASE_CLIENT_NAMESPACES,
  ...extra,
];

export const ROUTE_MESSAGE_NAMESPACES = {
  home: withBase("certificateTemplates", "hero", "home", "impact", "stickyCta"),
  purchase: withBase("certificateTemplates", "purchase"),
  purchaseSuccess: withBase("certificateTemplates", "purchase"),
  wanted: withBase("wanted"),
  wantedCase: withBase("wanted", "wantedCase"),
  registry: withBase("registry"),
  impact: withBase("impact"),
  membership: withBase("home", "membershipPage"),
  protectedFriend: withBase("protectedPage"),
  faq: withBase("faqPage", "impact"),
  career: withBase("career"),
  verify: withBase("verify", "verifySample"),
  gift: withBase("giftReveal"),
  certificateView: withBase("certificateAccess", "certificateDownload"),
  notFound: withBase("notFound"),
} as const;

export type RouteMessageKey = keyof typeof ROUTE_MESSAGE_NAMESPACES;

/**
 * Returns a shallow copy of `messages` containing only `namespaces`.
 * Unknown names are skipped silently.
 */
export function pickClientMessages(
  messages: AbstractIntlMessages,
  namespaces: readonly string[],
): AbstractIntlMessages {
  const picked: Record<string, AbstractIntlMessages[string]> = {};
  for (const key of namespaces) {
    if (key in messages) {
      picked[key] = messages[key];
    }
  }
  return picked;
}
