import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { createTrainCategoryLabelResolver } from "./transport-labels";

describe("createTrainCategoryLabelResolver", () => {
  const tEn = createAppTranslator("Transport", "en");
  const tHe = createAppTranslator("Transport", "he");

  it("shows Shinkansen for Japan trips", () => {
    const label = createTrainCategoryLabelResolver(tEn, "JP")("shinkansen");
    expect(label).toBe("Shinkansen");
    expect(createTrainCategoryLabelResolver(tHe, "JP")("shinkansen")).toBe("שינקנסן");
  });

  it("shows high-speed train label for non-JP trips", () => {
    expect(createTrainCategoryLabelResolver(tEn, "IT")("shinkansen")).toBe(
      "High-speed train",
    );
    expect(createTrainCategoryLabelResolver(tHe, "FR")("shinkansen")).toBe(
      "רכבת מהירה",
    );
  });
});
