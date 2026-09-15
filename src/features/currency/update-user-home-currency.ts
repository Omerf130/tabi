import "server-only";

import { isSupportedCurrencyCode } from "@/features/currency/currency-metadata";
import { getSupportedCurrencies } from "@/features/currency/queries";
import { connectDb } from "@/lib/db/connect";
import { User } from "@/models/User";

export class HomeCurrencyValidationError extends Error {
  readonly code: "invalid_currency" | "unsupported_currency";

  constructor(code: "invalid_currency" | "unsupported_currency") {
    super(code);
    this.code = code;
    this.name = "HomeCurrencyValidationError";
  }
}

export async function updateUserHomeCurrency(
  userId: string,
  homeCurrency: string,
): Promise<string> {
  const normalized = homeCurrency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new HomeCurrencyValidationError("invalid_currency");
  }

  const currencies = await getSupportedCurrencies();
  if (!isSupportedCurrencyCode(currencies, normalized)) {
    throw new HomeCurrencyValidationError("unsupported_currency");
  }

  await connectDb();
  await User.updateOne({ _id: userId }, { $set: { homeCurrency: normalized } });
  return normalized;
}
