import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { buildCurrencyRateHref } from "./constants";

describe("currency picker accessibility contract", () => {
  it("uses the approved search placeholder from messages", () => {
    const t = createAppTranslator("Currency", "he");
    expect(t("searchPlaceholder")).toBe("חיפוש מטבע...");
  });

  it("builds rate hrefs for arbitrary supported pairs", () => {
    const tripId = "507f1f77bcf86cd799439011";
    expect(buildCurrencyRateHref(tripId, "USD", "ILS")).toContain("from=USD");
    expect(buildCurrencyRateHref(tripId, "EUR", "JPY")).toContain("to=JPY");
    expect(buildCurrencyRateHref(tripId, "GBP", "USD")).toContain("from=GBP");
    expect(buildCurrencyRateHref(tripId, "KRW", "EUR")).toContain("from=KRW");
  });
});
