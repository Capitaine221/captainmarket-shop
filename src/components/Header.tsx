"use client";

import { useState } from "react";
import Link from "next/link";
import { mainMenu } from "@/lib/nav";
import CartTrigger from "./CartTrigger";
import WishlistIcon from "./WishlistIcon";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-white/10">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center gap-8 py-5">
          <button
            className="md:hidden text-cream"
            aria-label="Menu"
            onClick={() => setMobileOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>

          <Link href="/" className="font-heading text-lg tracking-wide shrink-0">
            CAPTAINMARKET
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1">
            {mainMenu.map((item) => (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-cream/90 hover:text-cream transition-colors"
                >
                  {item.title}
                  {item.children && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 mt-0.5">
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </Link>
                {item.children && (
                  <div className="absolute left-0 top-full hidden group-hover:block bg-ink-3 border border-white/10 rounded-md py-2 min-w-[240px] shadow-xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-cream/80 hover:text-gold hover:bg-white/5"
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-1 ml-auto">
            <Link
              href="/search"
              aria-label="Recherche"
              className="hidden sm:flex items-center justify-center w-9 h-9 text-cream hover:text-gold transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
            </Link>
            <Link
              href="/account"
              aria-label="Compte"
              className="hidden sm:flex items-center justify-center w-9 h-9 text-cream hover:text-gold transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M4.5 20c1.5-4 5-5.5 7.5-5.5s6 1.5 7.5 5.5" strokeLinecap="round" />
              </svg>
            </Link>
            <WishlistIcon />
            <CartTrigger />
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-ink-3 border-r border-white/10 overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <span className="font-heading text-base">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Fermer" className="text-cream/70 text-xl">
                ✕
              </button>
            </div>
            <nav className="py-2">
              {mainMenu.map((item) => (
                <div key={item.href} className="border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 px-5 py-3 text-sm text-cream/90"
                    >
                      {item.title}
                    </Link>
                    {item.children && (
                      <button
                        className="px-4 py-3 text-cream/60"
                        onClick={() =>
                          setMobileExpanded(mobileExpanded === item.href ? null : item.href)
                        }
                        aria-label="Sous-menu"
                      >
                        {mobileExpanded === item.href ? "−" : "+"}
                      </button>
                    )}
                  </div>
                  {item.children && mobileExpanded === item.href && (
                    <div className="pb-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-8 py-2 text-sm text-cream/60"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
