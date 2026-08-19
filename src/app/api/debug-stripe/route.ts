import { NextResponse } from "next/server";

// TEMPORARY diagnostic route — checks the STRIPE_SECRET_KEY value for non-ASCII characters
// without ever revealing the value itself.
export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const badChars: { index: number; code: number }[] = [];
  for (let i = 0; i < key.length; i++) {
    const code = key.charCodeAt(i);
    if (code > 126 || code < 32) badChars.push({ index: i, code });
  }

  return NextResponse.json({
    length: key.length,
    startsWithSkTest: key.startsWith("sk_test_"),
    isCleanAscii: badChars.length === 0,
    badChars,
  });
}
