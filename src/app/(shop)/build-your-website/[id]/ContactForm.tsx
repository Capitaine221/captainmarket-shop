"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm({ packageId }: { packageId: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/build-your-website/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          message: formData.get("message"),
          email: formData.get("email"),
          phone: formData.get("phone"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-ink-3 rounded-2xl px-6 py-8 text-center">
        <p className="text-cream">Thanks — your request has been sent. We&apos;ll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-wide text-cream/50 mb-2">
          Tell us as much as you can about the website you&apos;d like us to build for you.
        </label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full bg-ink-2 border border-white/15 rounded-btn px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-gold"
          placeholder="Pages, style, features, examples you like..."
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wide text-cream/50 mb-2">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full bg-ink-2 border border-white/15 rounded-btn px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-cream/50 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            className="w-full bg-ink-2 border border-white/15 rounded-btn px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-gold"
          />
        </div>
      </div>

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary py-3.5 px-8 text-sm font-semibold disabled:opacity-40"
      >
        {status === "sending" ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
