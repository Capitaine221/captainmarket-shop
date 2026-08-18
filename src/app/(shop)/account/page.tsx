import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="font-heading text-2xl mb-3">Account</h1>
      <p className="text-cream/60 mb-8">
        CaptainMarket currently checks out as a guest — no account needed. Track an order confirmation
        directly from the email you receive after checkout.
      </p>
      <Link href="/" className="text-gold hover:underline text-sm">
        Return to shop
      </Link>
    </div>
  );
}
