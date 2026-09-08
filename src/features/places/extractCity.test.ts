import { describe, expect, it } from "vitest";
import { extractCityFromAddressComponents, extractCityFromSecondaryText } from "./extractCity";

describe("extractCity", () => {
  it("prefers locality from address components", () => {
    expect(
      extractCityFromAddressComponents([
        { longText: "Shinjuku City", types: ["locality"] },
        { longText: "Tokyo", types: ["administrative_area_level_1"] },
      ]),
    ).toBe("Shinjuku City");
  });

  it("falls back to secondary suggestion text", () => {
    expect(extractCityFromSecondaryText("1-19-1 Kabukicho, Shinjuku, Tokyo")).toBe(
      "Tokyo",
    );
  });
});
