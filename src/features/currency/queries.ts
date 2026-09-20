import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import { getCurrentUser } from "@/features/auth/session";
import { resolveDestinationCurrency } from "@/features/trips/destination/resolve-destination-currency";
import { buildCurrencyCatalog } from "./currency-metadata";
import { DEFAULT_AMOUNT, DEFAULT_TO_CURRENCY } from "./constants";
import { resolveNeutralConverterFromCurrency } from "./resolve-neutral-converter-from";
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
  const [currencies, user, trip] = await Promise.all([
    getSupportedCurrencies(),
    getCurrentUser(),
    connectDb().then(() =>
      Trip.findById(tripId).select("destination.countryCode").lean(),
    ),
  ]);

  const destinationFromCurrency =
    resolveDestinationCurrency(trip?.destination?.countryCode) ?? null;

  const normalizedHome = user?.homeCurrency?.trim().toUpperCase();
  const initialTo =
    normalizedHome && currencies.some((c) => c.code === normalizedHome)
      ? normalizedHome
      : DEFAULT_TO_CURRENCY;

  const neutralFrom = resolveNeutralConverterFromCurrency(currencies, initialTo);
  const initialFrom = destinationFromCurrency ?? neutralFrom ?? initialTo;

  let initialRate: ExchangeRate | null = null;
  if (initialFrom !== initialTo) {
    try {
      initialRate = await getExchangeRate(initialFrom, initialTo);
    } catch (error) {
      if (!(error instanceof FrankfurterRequestError)) {
        throw error;
      }
    }
  }

  return {
    tripId,
    currencies,
    destinationFromCurrency,
    initialFrom,
    initialTo,
    initialAmount: DEFAULT_AMOUNT,
    initialRate,
    homeCurrency: user?.homeCurrency ?? null,
  };
}
