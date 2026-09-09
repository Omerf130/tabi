import { describe, expect, it } from "vitest";
import { CURRENCY_MESSAGES } from "./constants";
import { buildCurrencyRateHref } from "./constants";

describe("currency picker accessibility contract", () => {
  it("uses the approved search placeholder", () => {
    expect(CURRENCY_MESSAGES.searchPlaceholder).toBe("חיפוש מטבע...");
  });

  it("builds rate hrefs for arbitrary supported pairs", () => {
    const tripId = "507f1f77bcf86cd799439011";
    expect(buildCurrencyRateHref(tripId, "USD", "ILS")).toContain("from=USD");
    expect(buildCurrencyRateHref(tripId, "EUR", "JPY")).toContain("to=JPY");
    expect(buildCurrencyRateHref(tripId, "GBP", "USD")).toContain("from=GBP");
    expect(buildCurrencyRateHref(tripId, "KRW", "EUR")).toContain("from=KRW");
  });
});
