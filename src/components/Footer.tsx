import Link from "next/link";
import { footerShopMenu, footerHelpMenu } from "@/lib/nav";

export default function Footer() {
  return (
    <footer className="bg-ink-2 border-t border-line mt-16">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 font-heading text-lg mb-4">
            <span
              aria-hidden="true"
              className="grid place-items-center w-8 h-8 rounded-[10px] bg-gradient-to-br from-gold-2 to-gold text-[#1a1400] text-base font-bold"
            >
              C
            </span>
            CAPTAINMARKET
          </div>
          <p className="text-sm text-muted max-w-sm leading-relaxed">
            Authenticated streetwear, sneakers, accessories, and fragrance — sourced and sold with obsessive
            care.
          </p>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.14em] text-cream/60 mb-4 font-semibold">Shop</h3>
          <ul className="space-y-2.5">
            {footerShopMenu.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted hover:text-gold transition-colors">
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-[0.14em] text-cream/60 mb-4 font-semibold">Help</h3>
          <ul className="space-y-2.5">
            {footerHelpMenu.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted hover:text-gold transition-colors">
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay"].map((p) => (
              <span
                key={p}
                className="text-[11px] font-semibold border border-line bg-card rounded-md px-2.5 py-1 text-muted"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="text-xs text-muted flex items-center gap-4">
            <span>© {new Date().getFullYear()} CaptainMarket</span>
            <Link href="/policies/privacy-policy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
