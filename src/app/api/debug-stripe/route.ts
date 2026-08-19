import { NextResponse } from "next/server";

// TEMPORARY diagnostic route — tests raw connectivity to Stripe's API, bypassing the Stripe SDK
// entirely, to isolate whether failures are network-level or SDK/client-level.
export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  const results: Record<string, unknown> = { keyPresent: !!key };

  try {
    const start = Date.now();
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${key}` },
    });
    const body = await res.text();
    results.rawFetch = {
      ok: res.ok,
      status: res.status,
      ms: Date.now() - start,
      bodySnippet: body.slice(0, 200),
    };
  } catch (e) {
    results.rawFetch = { error: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
  }

  return NextResponse.json(results);
}
