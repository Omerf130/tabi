import { describe, expect, it } from "vitest";
import { resolveDuringSummaryWideTileId } from "./resolve-during-summary-wide-tile";

describe("resolveDuringSummaryWideTileId", () => {
  it("spans accommodation when present among three tiles", () => {
    expect(
      resolveDuringSummaryWideTileId(["weather", "tonight", "activities"]),
    ).toBe("tonight");
  });

  it("spans weather when three tiles without accommodation", () => {
    expect(
      resolveDuringSummaryWideTileId(["weather", "activities", "trip-day"]),
    ).toBe("weather");
  });

  it("does not span when four tiles", () => {
    expect(
      resolveDuringSummaryWideTileId([
        "weather",
        "tonight",
        "activities",
        "trip-day",
      ]),
    ).toBeNull();
  });
});
