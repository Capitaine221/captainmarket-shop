import { NextResponse } from "next/server";

// TEMPORARY diagnostic route — reports only presence/length of env vars, never their values.
// Remove once the Stripe env var issue is confirmed fixed.
export async function GET() {
  function status(name: string) {
    const value = process.env[name];
    return { present: !!value, length: value?.length ?? 0 };
  }

  return NextResponse.json({
    STRIPE_SECRET_KEY: status("STRIPE_SECRET_KEY"),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: status("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
    STRIPE_WEBHOOK_SECRET: status("STRIPE_WEBHOOK_SECRET"),
    TURSO_DATABASE_URL: status("TURSO_DATABASE_URL"),
  });
}
