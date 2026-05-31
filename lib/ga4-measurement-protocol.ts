import {
  buildCertificateAnalyticsItem,
  normalizeAnalyticsAttributionSource,
} from "@/lib/analytics-events";
import { getPublicTierKey, getTierPriceDollars } from "@/lib/tiers";

const GA4_ENDPOINT = "https://www.google-analytics.com/mp/collect";

type SendGa4PurchaseInput = {
  clientId?: string;
  transactionId: string;
  tier?: string;
  value?: number;
  currency?: string;
  source?: string;
  locale?: string;
  isGift?: boolean;
};

function normalizeGaMeasurementId(id?: string) {
  const trimmed = id?.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("G-") ? trimmed : `G-${trimmed}`;
}

function getMeasurementId() {
  return normalizeGaMeasurementId(
    process.env.GA4_MEASUREMENT_ID ||
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  );
}

export async function sendGa4PurchaseEvent({
  clientId,
  transactionId,
  tier,
  value,
  currency = "USD",
  source,
  locale,
  isGift,
}: SendGa4PurchaseInput) {
  const measurementId = getMeasurementId();
  const apiSecret = process.env.GA4_MEASUREMENT_PROTOCOL_SECRET?.trim();
  const safeClientId = clientId?.trim();

  if (!measurementId || !apiSecret || !safeClientId) {
    return {
      sent: false,
      reason: !safeClientId
        ? "missing-client-id"
        : !measurementId
          ? "missing-measurement-id"
          : "missing-api-secret",
    };
  }

  const publicTier = getPublicTierKey(tier);
  const canonicalSource = normalizeAnalyticsAttributionSource(source);
  const item = buildCertificateAnalyticsItem(publicTier);
  const eventValue =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : getTierPriceDollars(publicTier);
  const params: Record<string, unknown> = {
    transaction_id: transactionId,
    value: eventValue,
    currency,
    tier: publicTier,
    item_id: item.item_id,
    item_name: item.item_name,
    is_gift: Boolean(isGift),
    engagement_time_msec: 1,
    items: [item],
  };

  if (canonicalSource) params.source = canonicalSource;
  if (locale) params.locale = locale.slice(0, 12);

  const url = new URL(GA4_ENDPOINT);
  url.searchParams.set("measurement_id", measurementId);
  url.searchParams.set("api_secret", apiSecret);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        client_id: safeClientId,
        events: [
          {
            name: "purchase",
            params,
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.warn("[SHA GA4] Measurement Protocol purchase failed", {
        status: response.status,
        transactionId,
        body: body.slice(0, 300),
      });
      return { sent: false, reason: "http-error" };
    }

    return { sent: true };
  } catch (error) {
    console.warn("[SHA GA4] Measurement Protocol purchase failed", {
      transactionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { sent: false, reason: "network-error" };
  } finally {
    clearTimeout(timeout);
  }
}
