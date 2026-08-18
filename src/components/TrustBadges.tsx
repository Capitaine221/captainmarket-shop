const BADGES = [
  { label: "Authenticity Guaranteed", icon: "check" },
  { label: "Secure Checkout", icon: "lock" },
  { label: "Fast, Insured Shipping", icon: "truck" },
  { label: "7-Day Easy Returns", icon: "return" },
];

function Icon({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, className: "w-5 h-5" };
  if (name === "check")
    return (
      <svg {...common}>
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (name === "lock")
    return (
      <svg {...common}>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
      </svg>
    );
  if (name === "truck")
    return (
      <svg {...common}>
        <path d="M2 7h11v9H2z" />
        <path d="M13 10h4l3 3v3h-7z" />
        <circle cx="6" cy="18" r="1.6" />
        <circle cx="17" cy="18" r="1.6" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M9 14L4 9l5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h11a5 5 0 0 1 0 10h-1" strokeLinecap="round" />
    </svg>
  );
}

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/10">
      {BADGES.map((b) => (
        <div key={b.label} className="flex flex-col items-center text-center gap-2">
          <Icon name={b.icon} />
          <span className="text-xs text-cream/60">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
