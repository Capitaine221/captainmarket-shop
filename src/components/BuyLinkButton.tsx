"use client";

export default function BuyLinkButton({ url, className }: { url: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, "_blank", "noopener,noreferrer");
      }}
      className={
        className ??
        "absolute bottom-0 left-0 right-0 bg-ink/90 backdrop-blur text-cream text-xs font-medium py-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
      }
    >
      Buy
    </button>
  );
}
