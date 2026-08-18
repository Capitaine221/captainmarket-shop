"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="bg-ink-3">
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="font-heading text-2xl md:text-3xl mb-3">Join the List</h2>
        <p className="text-cream/60 mb-8">Be first to know about new drops, restocks, and private access.</p>
        {submitted ? (
          <p className="text-gold text-sm">Thanks — you&apos;re on the list.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="flex gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 bg-ink border border-white/15 rounded-btn px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-gold"
            />
            <button type="submit" className="btn-primary px-5 py-3 text-sm font-semibold">
              →
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
