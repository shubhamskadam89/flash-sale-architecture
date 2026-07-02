export function formatCurrency(value: unknown): string {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return "Not available";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(number);
}
