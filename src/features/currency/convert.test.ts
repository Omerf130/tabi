import { describe, expect, it } from "vitest";
import {
  convertAmount,
  formatCurrencyAmount,
  formatRateDate,
  formatRateValue,
  getCurrencyFractionDigits,
  invertExchangeRate,
  makeRatePairKey,
  normalizeAmountInput,
  parseAmount,
  roundForCurrency,
} from "./convert";

describe("currency convert helpers", () => {
  it("normalizes decimal input", () => {
    expect(normalizeAmountInput("1,234.50")).toBe("1234.50");
    expect(normalizeAmountInput("1000")).toBe("1000");
    expect(normalizeAmountInput("abc12.34x")).toBe("12.34");
    expect(normalizeAmountInput("")).toBe("");
  });

  it("parses valid amounts and rejects invalid input", () => {
    expect(parseAmount("1000")).toBe(1000);
    expect(parseAmount("12.5")).toBe(12.5);
    expect(parseAmount("")).toBeNull();
    expect(parseAmount(".")).toBeNull();
    expect(parseAmount("-5")).toBeNull();
  });

  it("converts using loaded rate without refetch semantics", () => {
    expect(convertAmount(1000, 0.0196)).toBeCloseTo(19.6, 5);
    expect(convertAmount(10000, 0.0196)).toBeCloseTo(196, 5);
  });

  it("inverts exchange rates safely", () => {
    expect(invertExchangeRate(0.0196)).toBeCloseTo(51.020408, 4);
    expect(invertExchangeRate(0)).toBeNull();
    expect(invertExchangeRate(Number.NaN)).toBeNull();
  });

  it("uses Intl metadata for currency fraction digits", () => {
    expect(getCurrencyFractionDigits("JPY")).toBe(0);
    expect(getCurrencyFractionDigits("USD")).toBe(2);
  });

  it("rounds converted values per currency rules", () => {
    expect(roundForCurrency(19.567, "ILS")).toBe(19.57);
    expect(roundForCurrency(1000.4, "JPY")).toBe(1000);
  });

  it("formats currency amounts without floating-point artifacts", () => {
    const formatted = formatCurrencyAmount(1000, "JPY");
    expect(formatted).toContain("1");
    expect(formatted).not.toContain("999.999");
  });

  it("formats large amounts", () => {
    const formatted = formatCurrencyAmount(1_000_000, "USD");
    expect(formatted).toMatch(/1,000,000|1\.000\.000|1\s000\s000/);
  });

  it("formats rate values and provider dates", () => {
    expect(formatRateValue(0.0196)).toBeTruthy();
    expect(formatRateDate("2026-09-09")).toMatch(/09/);
  });

  it("builds stable pair keys", () => {
    expect(makeRatePairKey("JPY", "ILS")).toBe("JPY:ILS");
  });
});
