import Stripe from "stripe";

/** Price in cents for each tier */
export const TIER_PRICES: Record<string, number> = {
  basic: 400,
  protected: 400,
  nonsnack: 1900,
  business: 9900,
};

/** How much of each sale goes to shark conservation (in cents). */
export const TIER_DONATIONS: Record<string, number> = {
  basic: 100,
  protected: 100,
  nonsnack: 1200,
  business: 7000,
};

/** Human-readable tier names for Stripe line items */
export const TIER_NAMES: Record<string, string> = {
  basic: "Protected Friend Status",
  protected: "Protected Friend Status",
  nonsnack: "Non-Snack Recognition",
  business: "Shark-Approved Zone Certification",
};

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
