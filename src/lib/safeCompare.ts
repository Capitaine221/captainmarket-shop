import { createHash, timingSafeEqual } from "node:crypto";

/** Constant-time string comparison (hashes both sides first so differing lengths don't leak via early-exit). */
export function safeCompare(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}
