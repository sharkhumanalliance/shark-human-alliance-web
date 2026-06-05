import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import {
  pickClientMessages,
  ROUTE_MESSAGE_NAMESPACES,
  type RouteMessageKey,
} from "@/lib/client-messages";

/**
 * Server component that wraps a page subtree in a NextIntlClientProvider
 * carrying only the message namespaces that route needs (see
 * lib/client-messages.ts). Rendered from a Server Component, next-intl injects
 * locale/now/timeZone automatically; we only override `messages`.
 *
 * Usage (inside a page.tsx, which is an async Server Component):
 *   return <RouteMessages route="wanted">…page JSX…</RouteMessages>;
 */
export async function RouteMessages({
  route,
  children,
}: {
  route: RouteMessageKey;
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider
      messages={pickClientMessages(messages, ROUTE_MESSAGE_NAMESPACES[route])}
    >
      {children}
    </NextIntlClientProvider>
  );
}
