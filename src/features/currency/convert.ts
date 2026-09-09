export function normalizeAmountInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const sanitized = trimmed.replace(/,/g, "").replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = sanitized.split(".");
  const fraction = rest.join("").slice(0, 8);

  if (rest.length === 0) {
    return whole;
  }

  return `${whole}.${fraction}`;
}

export function parseAmount(value: string): number | null {
  if (value.trim().includes("-")) {
    return null;
  }

  const normalized = normalizeAmountInput(value);
  if (!normalized || normalized === ".") {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export function convertAmount(amount: number, rate: number): number {
  return amount * rate;
}

export function invertExchangeRate(rate: number): number | null {
  if (!Number.isFinite(rate) || rate <= 0) {
    return null;
  }

  return 1 / rate;
}

export function getCurrencyFractionDigits(
  currencyCode: string,
  locale = "he-IL",
): number {
  const { maximumFractionDigits } = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).resolvedOptions();

  return maximumFractionDigits ?? 2;
}

export function roundForCurrency(amount: number, currencyCode: string): number {
  const fractionDigits = getCurrencyFractionDigits(currencyCode);
  const factor = 10 ** fractionDigits;
  return Math.round(amount * factor) / factor;
}

export function formatCurrencyAmount(
  amount: number,
  currencyCode: string,
  locale = "he-IL",
): string {
  const rounded = roundForCurrency(amount, currencyCode);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(rounded);
}

export function formatRateValue(rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0) {
    return "—";
  }

  const abs = Math.abs(rate);
  const fractionDigits =
    abs >= 1 ? 4 : abs >= 0.01 ? 4 : abs >= 0.0001 ? 6 : 8;

  return new Intl.NumberFormat("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(rate);
}

export function formatRateDate(date: string, locale = "he-IL"): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) {
    return date;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function makeRatePairKey(from: string, to: string): string {
  return `${from}:${to}`;
}
