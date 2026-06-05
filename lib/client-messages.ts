import type { AbstractIntlMessages } from "next-intl";

/**
 * Top-level message namespaces that are actually consumed by client
 * components (anything calling `useTranslations(...)`). Server components use
 * `getTranslations`, which reads the full catalog server-side and does NOT
 * depend on what we hand to <NextIntlClientProvider>. So we only ship these to
 * the browser, which trims the hydration payload (drops seo.*, the long legal
 * text pages, etc.).
 *
 * RULE: if you add `useTranslations("x")` in a client component, add the
 * top-level namespace "x" here, or you'll get MISSING_MESSAGE at runtime.
 * Derive the current set with:
 *   grep -rhoE 'useTranslations\("[^"]*"\)' components app | sort -u
 */
export const CLIENT_MESSAGE_NAMESPACES = [
  "accessibility",
  "career",
  "certificateAccess",
  "certificateDownload",
  "certificateTemplates",
  "cookies",
  "faqPage",
  "footer",
  "giftReveal",
  "header",
  "hero",
  "home",
  "impact",
  "membershipPage",
  "notFound",
  "protectedPage",
  "purchase",
  "registry",
  "stickyCta",
  "verify",
  "verifySample",
  "wanted",
  "wantedCase",
] as const;

/**
 * Returns a shallow copy of `messages` containing only the namespaces listed in
 * CLIENT_MESSAGE_NAMESPACES. Unknown names are skipped silently.
 */
export function pickClientMessages(
  messages: AbstractIntlMessages,
): AbstractIntlMessages {
  const picked: Record<string, AbstractIntlMessages[string]> = {};
  for (const key of CLIENT_MESSAGE_NAMESPACES) {
    if (key in messages) {
      picked[key] = messages[key];
    }
  }
  return picked;
}
