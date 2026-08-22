export function formatCents(cents: number, currency = "CAD") {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency }).format(cents / 100);
}

export function formatPriceRange(minCents: number, maxCents: number | null, currency = "CAD") {
  if (maxCents == null || maxCents === minCents) return formatCents(minCents, currency);
  return `${formatCents(minCents, currency)} – ${formatCents(maxCents, currency)}`;
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
