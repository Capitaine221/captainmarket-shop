"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="font-heading text-2xl md:text-3xl mb-3">Contact</h1>
      <p className="text-cream/60 mb-10">
        Questions about an order, authentication, or a product? Send us a message and we&apos;ll get back to
        you shortly.
      </p>

      {submitted ? (
        <p className="text-gold">Thanks for reaching out — we&apos;ll reply soon.</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs uppercase tracking-wide text-cream/50 mb-2">Name</label>
            <input
              required
              className="w-full bg-ink-2 border border-white/15 rounded-btn px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-cream/50 mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full bg-ink-2 border border-white/15 rounded-btn px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-cream/50 mb-2">Message</label>
            <textarea
              required
              rows={5}
              className="w-full bg-ink-2 border border-white/15 rounded-btn px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>
          <button type="submit" className="btn-primary px-6 py-3 text-sm font-semibold">
            Send
          </button>
        </form>
      )}
    </div>
  );
}
