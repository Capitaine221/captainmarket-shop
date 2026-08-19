import { NextResponse } from "next/server";

// TEMPORARY diagnostic route — checks sensitive env vars for non-ASCII characters
// (e.g. masked-field bullets copied by mistake) without ever revealing their values.
const VARS_TO_CHECK = [
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "NEXT_PUBLIC_SITE_URL",
];

function checkValue(value: string) {
  const badChars: { index: number; code: number }[] = [];
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code > 126 || code < 32) badChars.push({ index: i, code });
  }
  return { present: value.length > 0, length: value.length, isCleanAscii: badChars.length === 0, badCharCount: badChars.length };
}

export async function GET() {
  const results: Record<string, unknown> = {};
  for (const name of VARS_TO_CHECK) {
    results[name] = checkValue(process.env[name] ?? "");
  }
  return NextResponse.json(results);
}
