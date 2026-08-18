import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-3">Paiement annulé</h1>
      <p className="text-neutral-500 mb-8">Ton panier est toujours là, tu peux réessayer quand tu veux.</p>
      <Link href="/cart" className="underline">
        Retour au panier
      </Link>
    </div>
  );
}
