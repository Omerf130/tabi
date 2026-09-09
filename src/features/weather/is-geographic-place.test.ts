import { describe, expect, it } from "vitest";
import { isGeographicWeatherPlace } from "./is-geographic-place";

describe("isGeographicWeatherPlace", () => {
  it("accepts locality-style places", () => {
    expect(isGeographicWeatherPlace(["locality", "political"], "locality")).toBe(true);
  });

  it("rejects restaurants and other POIs", () => {
    expect(isGeographicWeatherPlace(["restaurant", "food", "point_of_interest"], "restaurant")).toBe(
      false,
    );
    expect(isGeographicWeatherPlace(["store", "point_of_interest"], "store")).toBe(false);
    expect(isGeographicWeatherPlace(["lodging"], "lodging")).toBe(false);
  });
});
