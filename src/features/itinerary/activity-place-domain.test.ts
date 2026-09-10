import { describe, expect, it } from "vitest";
import {
  clearGoogleActivityFields,
  isGoogleBackedActivity,
  resolveStoredActivityPlaceSource,
  toActivityFormValuesFromGoogleSelection,
  toActivityPlaceSearchSelectionFromFormValues,
} from "./activity-place-domain";

describe("activity-place-domain", () => {
  it("defaults missing placeSource to manual", () => {
    expect(resolveStoredActivityPlaceSource(undefined)).toBe("manual");
    expect(resolveStoredActivityPlaceSource(null)).toBe("manual");
  });

  it("detects google-backed activities", () => {
    expect(
      isGoogleBackedActivity({
        placeSource: "google",
        googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      }),
    ).toBe(true);
    expect(
      isGoogleBackedActivity({
        placeSource: "manual",
        googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      }),
    ).toBe(false);
  });

  it("maps google selection to activity snapshot fields", () => {
    expect(
      toActivityFormValuesFromGoogleSelection({
        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        primaryText: "Nishiki Market",
        secondaryText: "Kyoto",
        formattedAddress: "609 Nishidaimonjicho, Nakagyo Ward, Kyoto",
        city: "Kyoto",
        country: "Japan",
        latitude: 35.005,
        longitude: 135.765,
        googleMapsUrl: "https://maps.google.com/?cid=123",
      }),
    ).toEqual({
      placeSource: "google",
      googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      locationName: "Nishiki Market",
      address: "609 Nishidaimonjicho, Nakagyo Ward, Kyoto",
      city: "Kyoto",
      country: "Japan",
      latitude: "35.005",
      longitude: "135.765",
      googleMapsUrl: "https://maps.google.com/?cid=123",
    });
  });

  it("builds edit preview from persisted snapshot without Google", () => {
    const preview = toActivityPlaceSearchSelectionFromFormValues({
      placeSource: "google",
      googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      locationName: "Nishiki Market",
      address: "609 Nishidaimonjicho, Nakagyo Ward, Kyoto",
      city: "Kyoto",
      country: "Japan",
      latitude: "35.005",
      longitude: "135.765",
      googleMapsUrl: "https://maps.google.com/?cid=123",
    });

    expect(preview?.primaryText).toBe("Nishiki Market");
    expect(preview?.latitude).toBe(35.005);
    expect(preview?.googleMapsUrl).toContain("maps.google.com");
  });

  it("clears google-only fields when switching to manual", () => {
    expect(clearGoogleActivityFields()).toEqual({
      placeSource: "manual",
      googlePlaceId: "",
      locationName: "",
      address: "",
      city: "",
      country: "",
      latitude: "",
      longitude: "",
      googleMapsUrl: "",
    });
  });
});
