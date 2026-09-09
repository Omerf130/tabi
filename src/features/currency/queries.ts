import "server-only";

import { buildCurrencyCatalog } from "./currency-metadata";
import {
  DEFAULT_AMOUNT,
  DEFAULT_FROM_CURRENCY,
  DEFAULT_TO_CURRENCY,
} from "./constants";
import {
  fetchFrankfurterCurrencies,
  fetchFrankfurterRate,
  FrankfurterRequestError,
} from "./frankfurter.server";
import type { CurrencyConverterInitialData, ExchangeRate } from "./types";

export async function getSupportedCurrencies() {
  const records = await fetchFrankfurterCurrencies();
  return buildCurrencyCatalog(records);
}

export async function getExchangeRate(
  from: string,
  to: string,
): Promise<ExchangeRate> {
  return fetchFrankfurterRate(from, to);
}

export async function prepareCurrencyConverterPage(
  tripId: string,
): Promise<CurrencyConverterInitialData> {
  const currencies = await getSupportedCurrencies();

  let initialRate: ExchangeRate | null = null;
  try {
    initialRate = await getExchangeRate(DEFAULT_FROM_CURRENCY, DEFAULT_TO_CURRENCY);
  } catch (error) {
    if (!(error instanceof FrankfurterRequestError)) {
      throw error;
    }
  }

  return {
    tripId,
    currencies,
    initialFrom: DEFAULT_FROM_CURRENCY,
    initialTo: DEFAULT_TO_CURRENCY,
    initialAmount: DEFAULT_AMOUNT,
    initialRate,
  };
}
