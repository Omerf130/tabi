import { describe, expect, it } from "vitest";
import enMessages from "../../../messages/en.json";
import heMessages from "../../../messages/he.json";

const TRAVEL_TOOL_NAMESPACES = [
  "Documents",
  "TravelHub",
  "Accommodation",
  "Transport",
  "Weather",
  "Emergency",
  "Language",
] as const;

describe("travel tools i18n messages", () => {
  it("defines matching namespace keys in Hebrew and English", () => {
    for (const namespace of TRAVEL_TOOL_NAMESPACES) {
      expect(Object.keys(heMessages[namespace])).toEqual(Object.keys(enMessages[namespace]));
    }
  });
});
