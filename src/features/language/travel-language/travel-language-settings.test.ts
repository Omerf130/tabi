import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { resolveTripTravelLanguage } from "@/features/trips/destination/resolve-trip-travel-language";
import type { TripWorkspace } from "@/features/trips/public-trip";
import { UNKNOWN_TRIP_TRAVEL_LANGUAGE_FIELDS } from "@/features/trips/public-trip";
import {
  isAzureSupportedTravelLanguageCode,
  listSupportedTravelLanguageOptions,
} from "../translation/azure-supported-travel-languages";
import { updateTripTravelLanguageSchema } from "./update-trip-travel-language-schema";
import { buildTravelLanguageSettingsViewModel } from "./build-travel-language-settings-view-model";

const tripId = "507f1f77bcf86cd799439011";

function makeTrip(overrides: Partial<TripWorkspace> = {}): TripWorkspace {
  const destination = overrides.destination ?? {
    displayName: "Rome",
    country: "Italy",
    countryCode: "IT",
  };
  const travel = resolveTripTravelLanguage({
    countryCode: destination.countryCode,
    travelLanguageCode:
      overrides.travelLanguageCode !== undefined ? overrides.travelLanguageCode : null,
  });

  return {
    id: tripId,
    name: "Trip",
    description: "",
    startDate: "2026-01-01",
    endDate: "2026-01-07",
    role: "owner",
    themeKey: "default",
    destinationCalendarTimeZone: "UTC",
    destination,
    ...UNKNOWN_TRIP_TRAVEL_LANGUAGE_FIELDS,
    effectiveTravelLanguageCode: travel.effectiveTravelLanguageCode,
    travelLanguageSource: travel.source,
    alternativeTravelLanguageCodes: travel.alternativeTravelLanguageCodes,
    travelLanguageCode: travel.travelLanguageCode,
    ...overrides,
  };
}

describe("travel language settings view model", () => {
  const t = createAppTranslator("Settings", "en");

  it("shows destination default for automatic IT trip", () => {
    const model = buildTravelLanguageSettingsViewModel({
      trip: makeTrip(),
      isOwner: true,
      locale: "en",
      t,
    });

    expect(model.destinationDefaultLanguageCode).toBe("it");
    expect(model.effectiveLanguageCode).toBe("it");
    expect(model.selectionSource).toBe("automatic");
  });

  it("shows explicit override source", () => {
    const trip = makeTrip({
      travelLanguageCode: "es",
      effectiveTravelLanguageCode: "es",
      travelLanguageSource: "override",
    });

    const model = buildTravelLanguageSettingsViewModel({
      trip,
      isOwner: true,
      locale: "en",
      t,
    });

    expect(model.selectionSource).toBe("override");
    expect(model.overrideLanguageCode).toBe("es");
    expect(model.effectiveLanguageCode).toBe("es");
  });

  it("includes CA/CH relevant alternatives in recommended list", () => {
    const caTrip = makeTrip({
      destination: { displayName: "Toronto", country: "Canada", countryCode: "CA" },
      effectiveTravelLanguageCode: "en",
      travelLanguageSource: "country-default",
      alternativeTravelLanguageCodes: ["fr"],
    });
    const chTrip = makeTrip({
      destination: { displayName: "Zürich", country: "Switzerland", countryCode: "CH" },
      effectiveTravelLanguageCode: "de",
      travelLanguageSource: "country-default",
      alternativeTravelLanguageCodes: ["gsw", "fr", "it", "en"],
    });

    const caModel = buildTravelLanguageSettingsViewModel({
      trip: caTrip,
      isOwner: true,
      locale: "en",
      t,
    });
    const chModel = buildTravelLanguageSettingsViewModel({
      trip: chTrip,
      isOwner: true,
      locale: "en",
      t,
    });

    expect(caModel.recommendedLanguages.map((entry) => entry.code)).toContain("fr");
    expect(chModel.recommendedLanguages.map((entry) => entry.code)).toEqual(
      expect.arrayContaining(["de", "fr", "it", "en"]),
    );
  });

  it("exposes broader supported language list beyond recommended", () => {
    const model = buildTravelLanguageSettingsViewModel({
      trip: makeTrip(),
      isOwner: true,
      locale: "en",
      t,
    });

    expect(model.allLanguages.length).toBeGreaterThan(model.recommendedLanguages.length);
    expect(model.allLanguages.some((entry) => entry.code === "ja")).toBe(true);
    for (const entry of model.allLanguages) {
      expect(entry.label).not.toBe(entry.code);
    }
  });

  it("automatic JP resolves to ja in effective language display", () => {
    const trip = makeTrip({
      destination: { displayName: "Tokyo", country: "Japan", countryCode: "JP" },
      effectiveTravelLanguageCode: "ja",
      travelLanguageSource: "country-default",
    });

    const model = buildTravelLanguageSettingsViewModel({
      trip,
      isOwner: true,
      locale: "en",
      t,
    });

    expect(model.destinationDefaultLanguageCode).toBe("ja");
    expect(model.effectiveLanguageCode).toBe("ja");
  });
});

describe("updateTripTravelLanguageSchema", () => {
  it("accepts automatic mode without a code", () => {
    const parsed = updateTripTravelLanguageSchema.safeParse({
      tripId,
      selectionMode: "automatic",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid language codes", () => {
    const parsed = updateTripTravelLanguageSchema.safeParse({
      tripId,
      selectionMode: "manual",
      travelLanguageCode: "not-valid!!!",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects unsupported Azure targets", () => {
    expect(isAzureSupportedTravelLanguageCode("xx-fake")).toBe(false);
    const parsed = updateTripTravelLanguageSchema.safeParse({
      tripId,
      selectionMode: "manual",
      travelLanguageCode: "xx-fake",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts supported manual selection", () => {
    const parsed = updateTripTravelLanguageSchema.safeParse({
      tripId,
      selectionMode: "manual",
      travelLanguageCode: "es",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("supported travel language metadata", () => {
  it("lists deterministic Azure-aligned options", () => {
    const options = listSupportedTravelLanguageOptions("en");
    expect(options.length).toBeGreaterThan(20);
    expect(options.every((entry) => isAzureSupportedTravelLanguageCode(entry.code))).toBe(
      true,
    );
  });
});
