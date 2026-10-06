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
        "btn-primary absolute inset-x-3 bottom-3 text-xs py-2.5 md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0"
      }
    >
      Buy
    </button>
  );
}
