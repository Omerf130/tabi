import { describe, expect, it } from "vitest";
import { toActivityDocumentFields } from "./activity-document-fields";
import type { ActivityFieldsInput } from "./schemas";

describe("toActivityDocumentFields", () => {
  it("persists google snapshot fields", () => {
    expect(
      toActivityDocumentFields({
        placeSource: "google",
        title: "Market",
        type: "shopping",
        date: "2026-10-26",
        googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        locationName: "Nishiki Market",
        latitude: 35.005,
        longitude: 135.765,
        address: "Kyoto address",
        city: "Kyoto",
        country: "Japan",
        googleMapsUrl: "https://maps.google.com/?cid=123",
      } as ActivityFieldsInput),
    ).toEqual({
      placeSource: "google",
      googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      locationName: "Nishiki Market",
      address: "Kyoto address",
      city: "Kyoto",
      country: "Japan",
      latitude: 35.005,
      longitude: 135.765,
      googleMapsUrl: "https://maps.google.com/?cid=123",
    });
  });

  it("clears google fields for manual activities", () => {
    expect(
      toActivityDocumentFields({
        placeSource: "manual",
        title: "Walk",
        type: "freeTime",
        date: "2026-10-26",
        locationName: "Park",
        address: "Near hotel",
      } as ActivityFieldsInput),
    ).toEqual({
      placeSource: "manual",
      googlePlaceId: null,
      locationName: "Park",
      address: "Near hotel",
      city: null,
      country: null,
      latitude: null,
      longitude: null,
      googleMapsUrl: null,
    });
  });
});
