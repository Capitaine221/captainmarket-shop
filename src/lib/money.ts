export function formatCents(cents: number, currency = "CAD") {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency }).format(cents / 100);
}

export function formatPriceRange(minCents: number, maxCents: number | null, currency = "CAD") {
  if (maxCents == null || maxCents === minCents) return formatCents(minCents, currency);
  return `${formatCents(minCents, currency)} – ${formatCents(maxCents, currency)}`;
}

/** Effective price a customer actually pays: the sale price when on sale, otherwise the regular price. */
export function effectivePriceCents(item: { priceCents: number; onSale: boolean; salePriceCents: number | null }) {
  return item.onSale && item.salePriceCents != null ? item.salePriceCents : item.priceCents;
}

/**
 * Returns the regular price (as a range when applicable) plus, when on sale, the sale price to
 * show alongside it — callers render the regular price struck through when `sale` is non-null.
 */
export function priceDisplay(
  minCents: number,
  maxCents: number | null,
  onSale: boolean,
  saleCents: number | null,
  currency = "CAD"
) {
  const original = formatPriceRange(minCents, maxCents, currency);
  if (onSale && saleCents != null) {
    return { original, sale: formatCents(saleCents, currency) };
  }
  return { original, sale: null as string | null };
}

const DIACRITICS_RE = new RegExp("[̀-ͯ]", "g");

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
