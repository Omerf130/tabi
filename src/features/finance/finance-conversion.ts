import "server-only";

import {
  convertAmount,
  roundForCurrency,
} from "@/features/currency/convert";
import { fetchFrankfurterRate, FrankfurterRequestError } from "@/features/currency/frankfurter.server";

export { FrankfurterRequestError };

export type ExpenseConversionSnapshot = {
  originalAmount: number;
  originalCurrency: string;
  baseAmount: number;
  baseCurrency: string;
  exchangeRate: number;
  exchangeRateDate: string;
};

export async function buildExpenseConversionSnapshot(input: {
  originalAmount: number;
  originalCurrency: string;
  baseCurrency: string;
  expenseDate: string;
}): Promise<ExpenseConversionSnapshot> {
  const originalAmount = roundForCurrency(
    input.originalAmount,
    input.originalCurrency,
  );

  if (input.originalCurrency === input.baseCurrency) {
    return {
      originalAmount,
      originalCurrency: input.originalCurrency,
      baseAmount: roundForCurrency(originalAmount, input.baseCurrency),
      baseCurrency: input.baseCurrency,
      exchangeRate: 1,
      exchangeRateDate: input.expenseDate,
    };
  }

  const rate = await fetchFrankfurterRate(input.originalCurrency, input.baseCurrency);
  const baseAmount = roundForCurrency(
    convertAmount(originalAmount, rate.rate),
    input.baseCurrency,
  );

  return {
    originalAmount,
    originalCurrency: input.originalCurrency,
    baseAmount,
    baseCurrency: input.baseCurrency,
    exchangeRate: rate.rate,
    exchangeRateDate: rate.date,
  };
}
