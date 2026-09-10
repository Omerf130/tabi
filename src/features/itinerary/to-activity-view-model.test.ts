import { describe, expect, it } from "vitest";
import { toActivityViewModel } from "./to-activity-view-model";

describe("toActivityViewModel", () => {
  it("treats missing placeSource as manual for legacy activities", () => {
    const model = toActivityViewModel({
      _id: { toString: () => "a1" },
      date: "2026-10-26",
      title: "Museum",
      type: "attraction",
      order: 0,
      locationName: "Ueno Park",
      address: "Tokyo",
    });

    expect(model.placeSource).toBe("manual");
    expect(model.locationName).toBe("Ueno Park");
    expect(model.googlePlaceId).toBeUndefined();
  });

  it("maps persisted google snapshot fields", () => {
    const model = toActivityViewModel({
      _id: { toString: () => "a1" },
      date: "2026-10-26",
      title: "Market visit",
      type: "shopping",
      order: 0,
      placeSource: "google",
      googlePlaceId: "ChIJNishiki",
      locationName: "Nishiki Market",
      address: "Kyoto address",
      city: "Kyoto",
      country: "Japan",
      latitude: 35.005,
      longitude: 135.765,
      googleMapsUrl: "https://maps.google.com/?cid=456",
    });

    expect(model.placeSource).toBe("google");
    expect(model.latitude).toBe(35.005);
    expect(model.googleMapsUrl).toContain("maps.google.com");
  });
});
