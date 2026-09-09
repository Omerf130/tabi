import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CURRENCY_PREFERENCE_KEYS } from "./constants";
import {
  readCurrencyPairPreference,
  resolveInitialCurrencyPair,
  writeCurrencyPairPreference,
} from "./currency-preferences";

describe("currency preferences", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        clear: () => storage.clear(),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when preferences are missing or invalid", () => {
    expect(readCurrencyPairPreference()).toBeNull();
    window.localStorage.setItem(CURRENCY_PREFERENCE_KEYS.from, "USD");
    window.localStorage.setItem(CURRENCY_PREFERENCE_KEYS.to, "USD");
    expect(readCurrencyPairPreference()).toBeNull();
  });

  it("persists and restores a valid pair", () => {
    writeCurrencyPairPreference({ from: "EUR", to: "JPY" });
    expect(readCurrencyPairPreference()).toEqual({ from: "EUR", to: "JPY" });
  });

  it("falls back to JPY → ILS when no preference exists", () => {
    const currencies = [{ code: "JPY" }, { code: "ILS" }, { code: "USD" }];
    expect(resolveInitialCurrencyPair(currencies, "JPY", "ILS")).toEqual({
      from: "JPY",
      to: "ILS",
    });
  });

  it("restores a valid stored pair", () => {
    const currencies = [{ code: "USD" }, { code: "EUR" }, { code: "JPY" }];
    writeCurrencyPairPreference({ from: "USD", to: "EUR" });
    expect(resolveInitialCurrencyPair(currencies, "JPY", "ILS")).toEqual({
      from: "USD",
      to: "EUR",
    });
  });
});
