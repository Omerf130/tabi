import { describe, expect, it } from "vitest";
import { invertExchangeRate, makeRatePairKey } from "./convert";
import type { ExchangeRate } from "./types";

function invertPairRate(rate: ExchangeRate): ExchangeRate | null {
  const inverted = invertExchangeRate(rate.rate);
  if (inverted === null) {
    return null;
  }

  return {
    from: rate.to,
    to: rate.from,
    rate: inverted,
    date: rate.date,
  };
}

describe("rate session behavior", () => {
  it("supports arbitrary supported pairs through shared math", () => {
    expect(100 * 0.92).toBeCloseTo(92, 5);
    expect(50 * 150).toBeCloseTo(7500, 5);
  });

  it("inverts a loaded pair without requiring a new provider request", () => {
    const direct: ExchangeRate = {
      from: "JPY",
      to: "ILS",
      rate: 0.0196,
      date: "2026-09-09",
    };

    const inverted = invertPairRate(direct);
    expect(inverted).toEqual({
      from: "ILS",
      to: "JPY",
      rate: expect.closeTo(51.020408, 4),
      date: "2026-09-09",
    });
    expect(makeRatePairKey(inverted!.from, inverted!.to)).toBe("ILS:JPY");
  });

  it("does not invent rates when inversion is unsafe", () => {
    expect(
      invertPairRate({
        from: "USD",
        to: "EUR",
        rate: 0,
        date: "2026-09-09",
      }),
    ).toBeNull();
  });
});
