import { describe, expect, it } from "vitest";
import { buildTripDestinationContext } from "./trip-destination-context";
import { normalizeTravelLanguageCode } from "./normalize-travel-language-code";
import {
  resolveTripTravelLanguage,
  resolveTripTravelLanguageFromDestinationContext,
} from "./resolve-trip-travel-language";

describe("normalizeTravelLanguageCode", () => {
  it("normalizes casing for region subtags", () => {
    expect(normalizeTravelLanguageCode("EN-us")).toBe("en-US");
  });
});

describe("resolveTripTravelLanguage", () => {
  it("maps JP to ja", () => {
    const resolved = resolveTripTravelLanguage({ countryCode: "JP" });
    expect(resolved.effectiveTravelLanguageCode).toBe("ja");
    expect(resolved.source).toBe("country-default");
    expect(resolved.alternativeTravelLanguageCodes).toEqual([]);
  });

  it("maps IT to it", () => {
    const resolved = resolveTripTravelLanguage({ countryCode: "IT" });
    expect(resolved.effectiveTravelLanguageCode).toBe("it");
    expect(resolved.source).toBe("country-default");
  });

  it("maps FR to fr", () => {
    const resolved = resolveTripTravelLanguage({ countryCode: "FR" });
    expect(resolved.effectiveTravelLanguageCode).toBe("fr");
    expect(resolved.source).toBe("country-default");
  });

  it("returns unknown when countryCode is missing", () => {
    const resolved = resolveTripTravelLanguage({});
    expect(resolved.effectiveTravelLanguageCode).toBeNull();
    expect(resolved.source).toBe("unknown");
    expect(resolved.alternativeTravelLanguageCodes).toEqual([]);
  });

  it("uses explicit override when valid", () => {
    const resolved = resolveTripTravelLanguage({
      countryCode: "JP",
      travelLanguageCode: "en",
    });
    expect(resolved.effectiveTravelLanguageCode).toBe("en");
    expect(resolved.source).toBe("override");
    expect(resolved.travelLanguageCode).toBe("en");
  });

  it("maps IT with override es to es", () => {
    const resolved = resolveTripTravelLanguage({
      countryCode: "IT",
      travelLanguageCode: "es",
    });
    expect(resolved.effectiveTravelLanguageCode).toBe("es");
    expect(resolved.source).toBe("override");
  });

  it("does not apply invalid override as effective language", () => {
    const resolved = resolveTripTravelLanguage({
      countryCode: "IT",
      travelLanguageCode: "not-a-real-language-tag!!!",
    });
    expect(resolved.effectiveTravelLanguageCode).toBe("it");
    expect(resolved.source).toBe("country-default");
    expect(resolved.travelLanguageCode).toBe("not-a-real-language-tag!!!");
  });

  it("normalizes countryCode casing", () => {
    const resolved = resolveTripTravelLanguage({ countryCode: "jp" });
    expect(resolved.effectiveTravelLanguageCode).toBe("ja");
  });

  it("resolves CA with deterministic default and alternatives", () => {
    const resolved = resolveTripTravelLanguage({ countryCode: "CA" });
    expect(resolved.effectiveTravelLanguageCode).toBe("en");
    expect(resolved.source).toBe("country-default");
    expect(resolved.alternativeTravelLanguageCodes).toEqual(["fr"]);
  });

  it("resolves CH with deterministic default and alternatives", () => {
    const resolved = resolveTripTravelLanguage({ countryCode: "CH" });
    expect(resolved.effectiveTravelLanguageCode).toBe("de");
    expect(resolved.source).toBe("country-default");
    expect(resolved.alternativeTravelLanguageCodes).toEqual([
      "gsw",
      "fr",
      "it",
      "en",
    ]);
  });

  it("never falls back to Japanese when destination data is missing", () => {
    const resolved = resolveTripTravelLanguage({
      travelLanguageCode: null,
      countryCode: undefined,
    });
    expect(resolved.effectiveTravelLanguageCode).not.toBe("ja");
    expect(resolved.source).toBe("unknown");
  });

  it("does not infer from displayName via destination context helper", () => {
    const ctx = buildTripDestinationContext({
      tripId: "t1",
      destination: {
        googlePlaceId: "p1",
        displayName: "Tokyo",
        country: "Japan",
        latitude: 35.6762,
        longitude: 139.6503,
        timeZone: "Asia/Tokyo",
      },
      destinationTimeZone: "Asia/Tokyo",
    });
    const resolved = resolveTripTravelLanguageFromDestinationContext({}, ctx);
    expect(resolved.source).toBe("unknown");
    expect(resolved.effectiveTravelLanguageCode).not.toBe("ja");
  });
});
