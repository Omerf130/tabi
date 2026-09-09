import {
  EXCLUDED_CURRENCY_CODES,
  HEBREW_CURRENCY_NAME_OVERRIDES,
  PRIORITY_CURRENCY_CODES,
} from "./constants";
import type { FrankfurterCurrencyRecord } from "./frankfurter.server";
import type { CurrencyOption } from "./types";

const hebrewCurrencyNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames("he-IL", { type: "currency" })
    : null;

export function resolveHebrewCurrencyName(code: string): string {
  return (
    HEBREW_CURRENCY_NAME_OVERRIDES[code] ??
    hebrewCurrencyNames?.of(code) ??
    code
  );
}

export function isActiveFrankfurterCurrency(
  currency: FrankfurterCurrencyRecord,
): boolean {
  if (EXCLUDED_CURRENCY_CODES.has(currency.iso_code)) {
    return false;
  }

  // Frankfurter end_date is the latest available rate date, not delisting.
  // Hide only clearly obsolete currencies still present in the catalog.
  if (currency.end_date && currency.end_date.slice(0, 4) < "2005") {
    return false;
  }

  return true;
}

export function buildCurrencyCatalog(
  records: readonly FrankfurterCurrencyRecord[],
): CurrencyOption[] {
  return records
    .filter((record) => isActiveFrankfurterCurrency(record))
    .map((record) => ({
      code: record.iso_code,
      symbol: record.symbol?.trim() || record.iso_code,
      englishName: record.name.trim(),
      hebrewName: resolveHebrewCurrencyName(record.iso_code),
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

export function getPriorityCurrencies(
  currencies: readonly CurrencyOption[],
): CurrencyOption[] {
  const byCode = new Map(currencies.map((currency) => [currency.code, currency]));

  return PRIORITY_CURRENCY_CODES.map((code) => byCode.get(code)).filter(
    (currency): currency is CurrencyOption => Boolean(currency),
  );
}

export function findCurrencyOption(
  currencies: readonly CurrencyOption[],
  code: string,
): CurrencyOption | undefined {
  return currencies.find((currency) => currency.code === code);
}

export function isSupportedCurrencyCode(
  currencies: readonly Pick<CurrencyOption, "code">[],
  code: string,
): boolean {
  return currencies.some((currency) => currency.code === code);
}

export function filterCurrencyOptions(
  currencies: readonly CurrencyOption[],
  query: string,
): CurrencyOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [...currencies];
  }

  return currencies.filter((currency) => {
    const haystack = [
      currency.code,
      currency.symbol,
      currency.englishName,
      currency.hebrewName,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
