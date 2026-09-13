export const DEFAULT_FROM_CURRENCY = "JPY";
export const DEFAULT_TO_CURRENCY = "ILS";
export const DEFAULT_AMOUNT = "1000";

export const PRIORITY_CURRENCY_CODES = [
  "JPY",
  "ILS",
  "USD",
  "EUR",
  "GBP",
  "KRW",
] as const;

export const EXCLUDED_CURRENCY_CODES = new Set([
  "XAU",
  "XAG",
  "XPD",
  "XPT",
  "XDR",
]);

export const HEBREW_CURRENCY_NAME_OVERRIDES: Record<string, string> = {
  JPY: "ין יפני",
  ILS: "שקל ישראלי",
  USD: "דולר אמריקאי",
  EUR: "אירו",
  GBP: "לירה שטרלינג",
  KRW: "וון דרום-קוריאני",
};

export const CURRENCY_PREFERENCE_KEYS = {
  from: "tabi.currency.v1.from",
  to: "tabi.currency.v1.to",
} as const;

export const FRANKFURTER_API_BASE = "https://api.frankfurter.dev";
export const FRANKFURTER_REVALIDATE_SECONDS = 86_400;

export function buildCurrencyHref(tripId: string): string {
  return `/app/trips/${tripId}/currency`;
}

export function buildCurrencyRateHref(
  tripId: string,
  from: string,
  to: string,
): string {
  const params = new URLSearchParams({ from, to });
  return `/app/trips/${tripId}/currency/rate?${params.toString()}`;
}
