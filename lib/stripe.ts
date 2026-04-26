import Stripe from "stripe";
export { TIER_DONATIONS, TIER_NAMES, TIER_PRICES } from "@/lib/tiers";

/**
 * Returns a Stripe client instance.
 * Lazy-initialized to avoid crashing at build time when the secret key
 * is not available (Vercel only injects runtime env vars, not build-time).
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "[SHA] STRIPE_SECRET_KEY is not set. Cannot initialize Stripe."
    );
  }

  _stripe = new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });

  return _stripe;
}
