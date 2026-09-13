import { describe, expect, it } from "vitest";
import { formatAppDate, formatAppNumber } from "./formatting";

describe("formatting", () => {
  it("formats dates with locale-specific display locale", () => {
    const value = "2026-09-14T12:00:00.000Z";

    expect(formatAppDate(value, "he", { month: "short", day: "numeric" })).toMatch(
      /ספט|Sep/i,
    );
    expect(formatAppDate(value, "en", { month: "short", day: "numeric" })).toBe(
      "Sep 14",
    );
  });

  it("formats numbers with locale-specific display locale", () => {
    expect(formatAppNumber(1234.5, "en")).toBe("1,234.5");
    expect(formatAppNumber(1234.5, "he")).toContain("1");
  });
});
