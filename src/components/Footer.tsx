import Link from "next/link";
import { footerShopMenu, footerHelpMenu } from "@/lib/nav";

export default function Footer() {
  return (
    <footer className="bg-ink-3 border-t border-white/10 mt-24">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-heading text-lg mb-3">CAPTAINMARKET</div>
          <p className="text-sm text-cream/60 max-w-sm">
            Authenticated streetwear, sneakers, accessories, and fragrance — sourced and sold with obsessive
            care.
          </p>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-wider text-cream/50 mb-4">Shop</h3>
          <ul className="space-y-2.5">
            {footerShopMenu.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-cream/70 hover:text-gold">
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-wider text-cream/50 mb-4">Help</h3>
          <ul className="space-y-2.5">
            {footerHelpMenu.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-cream/70 hover:text-gold">
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-70">
            {["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay"].map((p) => (
              <span key={p} className="text-[10px] border border-white/20 rounded px-2 py-1 text-cream/60">
                {p}
              </span>
            ))}
          </div>
          <div className="text-xs text-cream/50 flex items-center gap-4">
            <span>© {new Date().getFullYear()} CaptainMarket</span>
            <Link href="/policies/privacy-policy" className="hover:text-gold">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
