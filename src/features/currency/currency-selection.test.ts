import { describe, expect, it } from "vitest";
import { resolveNextCurrencyPair } from "./currency-selection";

describe("resolveNextCurrencyPair", () => {
  it("updates FROM while keeping amount semantics unchanged", () => {
    expect(
      resolveNextCurrencyPair({ from: "JPY", to: "ILS" }, "from", "USD"),
    ).toEqual({ from: "USD", to: "ILS" });
  });

  it("updates TO for a new supported pair", () => {
    expect(
      resolveNextCurrencyPair({ from: "EUR", to: "JPY" }, "to", "GBP"),
    ).toEqual({ from: "EUR", to: "GBP" });
  });

  it("swaps when selecting the opposite currency on FROM", () => {
    expect(
      resolveNextCurrencyPair({ from: "JPY", to: "ILS" }, "from", "ILS"),
    ).toEqual({ from: "ILS", to: "JPY" });
  });

  it("swaps when selecting the opposite currency on TO", () => {
    expect(
      resolveNextCurrencyPair({ from: "USD", to: "EUR" }, "to", "USD"),
    ).toEqual({ from: "EUR", to: "USD" });
  });
});
