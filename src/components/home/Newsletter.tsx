"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-14 md:py-20">
      <div className="relative overflow-hidden rounded-[22px] border border-line bg-gradient-to-br from-card-2 to-card px-6 py-14 md:py-16 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[480px] h-[240px] rounded-full bg-gold/15 blur-3xl"
        />
        <div className="relative max-w-xl mx-auto">
          <p className="eyebrow mb-3">Stay in the loop</p>
          <h2 className="font-heading text-3xl md:text-4xl mb-3">Join the List</h2>
          <p className="text-muted mb-8">Be first to know about new drops, restocks, and private access.</p>
          {submitted ? (
            <p className="text-gold text-sm font-semibold" role="status">
              Thanks — you&apos;re on the list.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 min-h-[48px] bg-ink border border-line rounded-btn px-4 text-sm text-cream placeholder:text-muted outline-none focus:border-gold transition-colors"
              />
              <button type="submit" className="btn-primary min-h-[48px] px-6 text-sm">
                Subscribe →
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
