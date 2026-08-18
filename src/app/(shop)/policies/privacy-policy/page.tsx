export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-heading text-2xl md:text-3xl mb-8">Privacy Policy</h1>
      <div className="prose prose-invert text-cream/70 text-sm leading-relaxed space-y-4">
        <p>
          This Privacy Policy describes how CaptainMarket collects, uses, and discloses your personal
          information when you visit or make a purchase from this site.
        </p>
        <h2 className="text-cream font-heading text-lg mt-8 mb-2">Information We Collect</h2>
        <p>
          When you make a purchase, we collect information you provide such as your name, address, email,
          and payment details. Payment information is processed securely by Stripe and is never stored on
          our servers.
        </p>
        <h2 className="text-cream font-heading text-lg mt-8 mb-2">How We Use Your Information</h2>
        <p>
          We use the information we collect to fulfill orders, communicate with you, and improve our
          services.
        </p>
        <h2 className="text-cream font-heading text-lg mt-8 mb-2">Contact</h2>
        <p>
          If you have questions about this policy, reach out via our{" "}
          <a href="/pages/contact" className="text-gold hover:underline">
            contact page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
