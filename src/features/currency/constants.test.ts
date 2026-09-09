import { describe, expect, it } from "vitest";
import {
  buildCurrencyHref,
  buildCurrencyRateHref,
  DEFAULT_AMOUNT,
  DEFAULT_FROM_CURRENCY,
  DEFAULT_TO_CURRENCY,
  PRIORITY_CURRENCY_CODES,
} from "./constants";

const tripId = "507f1f77bcf86cd799439011";

describe("currency constants", () => {
  it("uses Japan-first defaults", () => {
    expect(DEFAULT_FROM_CURRENCY).toBe("JPY");
    expect(DEFAULT_TO_CURRENCY).toBe("ILS");
    expect(DEFAULT_AMOUNT).toBe("1000");
  });

  it("builds currency hrefs", () => {
    expect(buildCurrencyHref(tripId)).toBe(`/app/trips/${tripId}/currency`);
    expect(buildCurrencyRateHref(tripId, "JPY", "ILS")).toBe(
      `/app/trips/${tripId}/currency/rate?from=JPY&to=ILS`,
    );
  });

  it("lists priority currencies in product order", () => {
    expect(PRIORITY_CURRENCY_CODES).toEqual([
      "JPY",
      "ILS",
      "USD",
      "EUR",
      "GBP",
      "KRW",
    ]);
  });
});
