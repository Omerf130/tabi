import { describe, expect, it } from "vitest";
import {
  homeCurrencyPickerSelectedCode,
  isHomeCurrencySaveEnabled,
  isTripCurrencySaveEnabled,
  tripCurrencyPickerSelectedCode,
} from "./currency-settings-save-state";

describe("currency settings save state", () => {
  it("homeCurrency null → no currency preselected in picker", () => {
    expect(homeCurrencyPickerSelectedCode(null)).toBe("");
  });

  it("Save disabled until explicit home selection", () => {
    expect(
      isHomeCurrencySaveEnabled({ draft: null, saved: null, pending: false }),
    ).toBe(false);
    expect(
      isHomeCurrencySaveEnabled({ draft: "USD", saved: null, pending: false }),
    ).toBe(true);
  });

  it("existing homeCurrency → current value selected", () => {
    expect(homeCurrencyPickerSelectedCode("ILS")).toBe("ILS");
    expect(
      isHomeCurrencySaveEnabled({ draft: "ILS", saved: "ILS", pending: false }),
    ).toBe(false);
  });

  it("selecting a different currency enables Save", () => {
    expect(
      isHomeCurrencySaveEnabled({ draft: "EUR", saved: "ILS", pending: false }),
    ).toBe(true);
  });

  it("trip currency uses explicit draft as picker selection", () => {
    expect(tripCurrencyPickerSelectedCode("JPY")).toBe("JPY");
    expect(
      isTripCurrencySaveEnabled({
        draft: "USD",
        saved: "ILS",
        pending: false,
      }),
    ).toBe(true);
  });
});
