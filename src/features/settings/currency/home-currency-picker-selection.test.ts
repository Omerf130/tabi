import { describe, expect, it } from "vitest";
import { homeCurrencyPickerSelectedCode } from "./home-currency-picker-selection";

describe("homeCurrencyPickerSelectedCode", () => {
  it("returns empty selectedCode when homeCurrency is null so nothing is preselected", () => {
    expect(homeCurrencyPickerSelectedCode(null)).toBe("");
  });

  it("passes through an explicit user selection", () => {
    expect(homeCurrencyPickerSelectedCode("USD")).toBe("USD");
  });
});
