import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { createConditionLabelResolver } from "./condition-labels";

describe("createConditionLabelResolver", () => {
  it("returns Hebrew labels for known weather codes", () => {
    const resolve = createConditionLabelResolver(createAppTranslator("Weather", "he"));
    expect(resolve(1000, "Sunny")).toBe("בהיר");
    expect(resolve(1003, "Partly cloudy")).toBe("מעונן חלקית");
  });

  it("returns English labels for known weather codes", () => {
    const resolve = createConditionLabelResolver(createAppTranslator("Weather", "en"));
    expect(resolve(1000, "Sunny")).toBe("Clear");
  });

  it("falls back to provider English text for unknown codes", () => {
    const resolve = createConditionLabelResolver(createAppTranslator("Weather", "he"));
    expect(resolve(9999, "Unknown condition")).toBe("Unknown condition");
  });
});
