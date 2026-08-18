"use client";

import { useState } from "react";

const TABS = [
  {
    heading: "Authenticity & Condition",
    content:
      "Every item is inspected and authenticated by our team before listing. Condition and any signs of wear are noted in the product description — what you see is exactly what you get.",
  },
  {
    heading: "Shipping",
    content: "Insured, tracked shipping on every order. Most orders ship within 1–2 business days.",
  },
  {
    heading: "Returns & Exchanges",
    content:
      "7-day return window on eligible items. Item must be unworn with original packaging and tags attached.",
  },
];

export default function Tabs() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="border-t border-white/10 mt-8">
      {TABS.map((tab, i) => (
        <div key={tab.heading} className="border-b border-white/10">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left"
          >
            <span className="text-sm font-medium">{tab.heading}</span>
            <span className={`text-cream/50 transition-transform ${open === i ? "rotate-45" : ""}`}>+</span>
          </button>
          {open === i && <p className="text-sm text-cream/60 pb-5 pr-8">{tab.content}</p>}
        </div>
      ))}
    </div>
  );
}
