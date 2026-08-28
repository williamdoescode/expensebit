const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isValidMonth(value) {
  return value === "" || (typeof value === "string" && MONTH_PATTERN.test(value));
}

export function getNextMonth(value) {
  if (!isValidMonth(value) || !value) return "";
  const [year, month] = value.split("-").map(Number);
  const next = month === 12 ? [year + 1, 1] : [year, month + 1];
  return `${next[0]}-${String(next[1]).padStart(2, "0")}`;
}

export function getPreviousMonth(value) {
  if (!isValidMonth(value) || !value) return "";
  const [year, month] = value.split("-").map(Number);
  const previous = month === 1 ? [year - 1, 12] : [year, month - 1];
  return `${previous[0]}-${String(previous[1]).padStart(2, "0")}`;
}

export function formatMonth(value) {
  if (!isValidMonth(value) || !value) return "Previous month";
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, 1)));
}
