import { describe, expect, it } from "vitest";
import {
  buildCurrencyCatalog,
  filterCurrencyOptions,
  getPriorityCurrencies,
  isActiveFrankfurterCurrency,
  isSupportedCurrencyCode,
  resolveHebrewCurrencyName,
} from "./currency-metadata";
import type { FrankfurterCurrencyRecord } from "./frankfurter.server";

const sampleRecords: FrankfurterCurrencyRecord[] = [
  { iso_code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { iso_code: "ILS", name: "Israeli New Shekel", symbol: "₪" },
  { iso_code: "USD", name: "United States Dollar", symbol: "$" },
  { iso_code: "EUR", name: "Euro", symbol: "€" },
  { iso_code: "GBP", name: "British Pound", symbol: "£" },
  { iso_code: "KRW", name: "South Korean Won", symbol: "₩" },
  { iso_code: "XAU", name: "Gold", symbol: "XAU" },
  {
    iso_code: "ATS",
    name: "Austrian Schilling",
    symbol: "ATS",
    end_date: "2001-12-31",
  },
];

const extendedSample: typeof sampleRecords = [
  ...sampleRecords,
  { iso_code: "CHF", name: "Swiss Franc", symbol: "CHF", end_date: "2026-09-08" },
  { iso_code: "CAD", name: "Canadian Dollar", symbol: "$", end_date: "2026-09-08" },
  { iso_code: "AUD", name: "Australian Dollar", symbol: "$", end_date: "2026-09-08" },
  { iso_code: "CNY", name: "Chinese Renminbi Yuan", symbol: "¥", end_date: "2026-09-08" },
  { iso_code: "THB", name: "Thai Baht", symbol: "฿", end_date: "2026-09-08" },
  { iso_code: "PLN", name: "Polish Złoty", symbol: "zł", end_date: "2026-09-08" },
  { iso_code: "CZK", name: "Czech Koruna", symbol: "Kč", end_date: "2026-09-08" },
  { iso_code: "HUF", name: "Hungarian Forint", symbol: "Ft", end_date: "2026-09-08" },
  { iso_code: "RON", name: "Romanian Leu", symbol: "Lei", end_date: "2026-09-08" },
  { iso_code: "TRY", name: "Turkish Lira", symbol: "₺", end_date: "2026-09-08" },
  { iso_code: "ZAR", name: "South African Rand", symbol: "R", end_date: "2026-09-08" },
  { iso_code: "BRL", name: "Brazilian Real", symbol: "R$", end_date: "2026-09-08" },
  { iso_code: "MXN", name: "Mexican Peso", symbol: "$", end_date: "2026-09-08" },
  { iso_code: "INR", name: "Indian Rupee", symbol: "₹", end_date: "2026-09-08" },
  { iso_code: "SGD", name: "Singapore Dollar", symbol: "$", end_date: "2026-09-08" },
  { iso_code: "HKD", name: "Hong Kong Dollar", symbol: "$", end_date: "2026-09-08" },
  { iso_code: "NOK", name: "Norwegian Krone", symbol: "kr", end_date: "2026-09-08" },
  { iso_code: "SEK", name: "Swedish Krona", symbol: "kr", end_date: "2026-09-08" },
  { iso_code: "DKK", name: "Danish Krone", symbol: "kr.", end_date: "2026-09-08" },
];

describe("currency metadata", () => {
  it("filters excluded and obsolete currencies only", () => {
    expect(isActiveFrankfurterCurrency(sampleRecords[6]!)).toBe(false);
    expect(isActiveFrankfurterCurrency(sampleRecords[7]!)).toBe(false);
    expect(isActiveFrankfurterCurrency(sampleRecords[0]!)).toBe(true);
  });

  it("keeps active fiat currencies even when end_date is yesterday", () => {
    expect(
      isActiveFrankfurterCurrency({
        iso_code: "JPY",
        name: "Japanese Yen",
        end_date: "2026-09-08",
      }),
    ).toBe(true);
  });

  it("builds a general catalog with substantially more than the default pair", () => {
    const catalog = buildCurrencyCatalog(extendedSample);
    expect(catalog.length).toBeGreaterThan(20);
    expect(catalog.map((currency) => currency.code)).toEqual(
      expect.arrayContaining(["USD", "EUR", "GBP", "KRW", "JPY", "ILS"]),
    );
  });

  it("builds a sorted supported catalog", () => {
    const catalog = buildCurrencyCatalog(sampleRecords);
    expect(catalog.map((currency) => currency.code)).toEqual([
      "EUR",
      "GBP",
      "ILS",
      "JPY",
      "KRW",
      "USD",
    ]);
    expect(catalog.find((currency) => currency.code === "JPY")?.hebrewName).toBe(
      "ין יפני",
    );
  });

  it("uses curated Hebrew overrides for priority currencies", () => {
    expect(resolveHebrewCurrencyName("JPY")).toBe("ין יפני");
    expect(resolveHebrewCurrencyName("ILS")).toBe("שקל ישראלי");
  });

  it("returns priority currencies in product order", () => {
    const catalog = buildCurrencyCatalog(sampleRecords);
    expect(getPriorityCurrencies(catalog).map((currency) => currency.code)).toEqual(
      ["JPY", "ILS", "USD", "EUR", "GBP", "KRW"],
    );
  });

  it("searches by code, Hebrew name, English name, and symbol", () => {
    const catalog = buildCurrencyCatalog(sampleRecords);
    expect(filterCurrencyOptions(catalog, "jpy").map((c) => c.code)).toEqual([
      "JPY",
    ]);
    expect(filterCurrencyOptions(catalog, "ין").map((c) => c.code)).toEqual([
      "JPY",
    ]);
    expect(filterCurrencyOptions(catalog, "dollar").map((c) => c.code)).toEqual(
      ["USD"],
    );
    expect(filterCurrencyOptions(catalog, "₪").map((c) => c.code)).toEqual([
      "ILS",
    ]);
    expect(filterCurrencyOptions(catalog, "Pound").map((c) => c.code)).toEqual([
      "GBP",
    ]);
    expect(filterCurrencyOptions(catalog, "Euro").map((c) => c.code)).toEqual([
      "EUR",
    ]);
  });

  it("checks supported currency codes", () => {
    const catalog = buildCurrencyCatalog(sampleRecords);
    expect(isSupportedCurrencyCode(catalog, "USD")).toBe(true);
    expect(isSupportedCurrencyCode(catalog, "XAU")).toBe(false);
  });
});
