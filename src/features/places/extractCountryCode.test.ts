import { describe, expect, it } from "vitest";
import { extractCountryCodeFromAddressComponents } from "./extractCountryCode";

describe("extractCountryCodeFromAddressComponents", () => {
  it("extracts ISO country code", () => {
    expect(
      extractCountryCodeFromAddressComponents([
        { longText: "Japan", shortText: "JP", types: ["country"] },
      ]),
    ).toBe("JP");
  });
});
