const formatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(centavos = 0) {
  return formatter.format((Number.isFinite(centavos) ? centavos : 0) / 100);
}

export function formatCurrencyInput(centavos) {
  if (centavos === null || centavos === undefined) return "";
  return String(centavos / 100);
}

export function pesosToCentavos(value) {
  if (value === "") return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}
