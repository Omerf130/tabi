import { PRIORITY_CURRENCY_CODES } from "./constants";
import { isSupportedCurrencyCode } from "./currency-metadata";

/**
 * UI bootstrap when destination currency is unknown — not destination inference.
 * Excludes JPY so missing country never implies Japan.
 */
export function resolveNeutralConverterFromCurrency(
  currencies: readonly { code: string }[],
  toCurrency: string,
): string | null {
  for (const code of PRIORITY_CURRENCY_CODES) {
    if (code === "JPY") {
      continue;
    }
    if (code !== toCurrency && isSupportedCurrencyCode(currencies, code)) {
      return code;
    }
  }

  for (const option of currencies) {
    if (option.code !== toCurrency && option.code !== "JPY") {
      return option.code;
    }
  }

  return null;
}
