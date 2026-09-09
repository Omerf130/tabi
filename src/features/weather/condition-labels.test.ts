import { describe, expect, it } from "vitest";
import { resolveConditionLabel } from "./condition-labels";

describe("resolveConditionLabel", () => {
  it("returns Hebrew labels for known weather codes", () => {
    expect(resolveConditionLabel(1000, "Sunny")).toBe("בהיר");
    expect(resolveConditionLabel(1003, "Partly cloudy")).toBe("מעונן חלקית");
  });

  it("falls back to provider English text for unknown codes", () => {
    expect(resolveConditionLabel(9999, "Unknown condition")).toBe("Unknown condition");
  });
});
