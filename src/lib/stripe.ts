import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe() {
  if (!stripeSingleton) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    // Node's built-in https client is flaky in some serverless/edge runtimes (Netlify Functions
    // included) — the fetch-based client is far more reliable there.
    stripeSingleton = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
  }
  return stripeSingleton;
}
