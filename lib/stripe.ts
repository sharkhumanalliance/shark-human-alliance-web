import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "[SHA] STRIPE_SECRET_KEY is not set. Stripe checkout will not work."
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
  typescript: true,
});

/** Price in cents for each tier */
export const TIER_PRICES: Record<string, number> = {
  basic: 900,
  protected: 900,
  nonsnack: 2900,
  business: 9900,
};

/** Human-readable tier names for Stripe line items */
export const TIER_NAMES: Record<string, string> = {
  basic: "Protected Friend Status",
  protected: "Protected Friend Status",
  nonsnack: "Non-Snack Recognition",
  business: "Shark-Approved Zone Certification",
};
