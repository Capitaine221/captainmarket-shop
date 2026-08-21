import { Resend } from "resend";

let resendSingleton: Resend | null = null;

export function getResend() {
  if (!resendSingleton) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    resendSingleton = new Resend(key);
  }
  return resendSingleton;
}
