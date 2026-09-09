import { CURRENCY_PREFERENCE_KEYS } from "./constants";
import { isSupportedCurrencyCode } from "./currency-metadata";

export type CurrencyPairPreference = {
  from: string;
  to: string;
};

export function resolveInitialCurrencyPair(
  currencies: readonly { code: string }[],
  fallbackFrom: string,
  fallbackTo: string,
): CurrencyPairPreference {
  const preference = readCurrencyPairPreference();
  if (
    preference &&
    isSupportedCurrencyCode(currencies, preference.from) &&
    isSupportedCurrencyCode(currencies, preference.to) &&
    preference.from !== preference.to
  ) {
    return preference;
  }

  return { from: fallbackFrom, to: fallbackTo };
}

export function readCurrencyPairPreference(): CurrencyPairPreference | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const from = window.localStorage.getItem(CURRENCY_PREFERENCE_KEYS.from)?.trim();
    const to = window.localStorage.getItem(CURRENCY_PREFERENCE_KEYS.to)?.trim();

    if (!from || !to || from === to) {
      return null;
    }

    return { from, to };
  } catch {
    return null;
  }
}

export function writeCurrencyPairPreference(preference: CurrencyPairPreference): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CURRENCY_PREFERENCE_KEYS.from, preference.from);
    window.localStorage.setItem(CURRENCY_PREFERENCE_KEYS.to, preference.to);
  } catch {
    // Ignore storage failures in private browsing.
  }
}
