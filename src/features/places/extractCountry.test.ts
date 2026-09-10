import { describe, expect, it } from "vitest";
import { extractCountryFromAddressComponents } from "./extractCountry";

describe("extractCountryFromAddressComponents", () => {
  it("extracts country from address components", () => {
    expect(
      extractCountryFromAddressComponents([
        { longText: "Japan", shortText: "JP", types: ["country"] },
      ]),
    ).toBe("Japan");
  });
});
