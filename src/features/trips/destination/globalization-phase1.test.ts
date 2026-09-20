import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { buildListSeedItems } from "@/features/lists/build-list-seed-items";
import { resolveNeutralConverterFromCurrency } from "@/features/currency/resolve-neutral-converter-from";
import { resolveDefaultTransportTimezone } from "@/features/transport/resolve-default-transport-timezone";
import { resolveWeatherSeedFromDestination } from "@/features/weather/resolve-weather-seed-from-destination";
import { buildTripDestinationContext } from "./trip-destination-context";
import { resolveDestinationCurrency } from "./resolve-destination-currency";
import { resolvePlacesDisplayLanguageCode } from "./resolve-places-display-language";
import { resolveDayLocationCandidates } from "@/features/itinerary/resolve-day-location-candidates";

const root = process.cwd();

describe("Globalization Phase 1 — destination context", () => {
  it("never implies Japan when destination fields are missing", () => {
    const ctx = buildTripDestinationContext({
      tripId: "t1",
      destination: null,
      destinationTimeZone: "UTC",
    });
    expect(ctx.countryCode).toBeUndefined();
    expect(ctx.destinationTimeZone).toBe("UTC");
  });

  it("preserves Italy destination identity", () => {
    const ctx = buildTripDestinationContext({
      tripId: "t1",
      destination: {
        googlePlaceId: "p1",
        displayName: "Rome",
        country: "Italy",
        countryCode: "IT",
        latitude: 41.9028,
        longitude: 12.4964,
        timeZone: "Europe/Rome",
      },
      destinationTimeZone: "Europe/Rome",
    });
    expect(ctx.countryCode).toBe("IT");
    expect(ctx.displayName).toBe("Rome");
  });
});

describe("Globalization Phase 1 — destination currency", () => {
  it("maps representative destinations", () => {
    expect(resolveDestinationCurrency("JP")).toBe("JPY");
    expect(resolveDestinationCurrency("IT")).toBe("EUR");
    expect(resolveDestinationCurrency("US")).toBe("USD");
    expect(resolveDestinationCurrency("GB")).toBe("GBP");
  });

  it("returns neutral undefined for missing country", () => {
    expect(resolveDestinationCurrency(undefined)).toBeUndefined();
    expect(resolveDestinationCurrency("")).toBeUndefined();
    expect(resolveDestinationCurrency("ZZ")).toBeUndefined();
  });
});

describe("Globalization Phase 1 — itinerary day weather P0", () => {
  it("does not append Japan for Rome accommodation", () => {
    const candidates = resolveDayLocationCandidates({
      date: "2026-04-01",
      accommodations: [
        {
          id: "h1",
          tripId: "t1",
          placeSource: "manual",
          name: "Hotel",
          city: "Rome",
          checkInDate: "2026-04-01",
          checkOutDate: "2026-04-03",
          checkInLabel: "",
          checkOutLabel: "",
          dateRangeLabel: "",
          nightCount: 2,
          usesGoogleAttribution: false,
        },
      ],
      activities: [],
      dayTransports: [],
      transportRecords: new Map(),
      tripDestination: { country: "Italy", countryCode: "IT" },
    });
    expect(candidates[0]?.query).toBe("Rome, Italy");
    expect(candidates[0]?.query).not.toContain("Japan");
  });

  it("uses city only when trip country is missing", () => {
    const candidates = resolveDayLocationCandidates({
      date: "2026-04-01",
      accommodations: [
        {
          id: "h1",
          tripId: "t1",
          placeSource: "manual",
          name: "Hotel",
          city: "Rome",
          checkInDate: "2026-04-01",
          checkOutDate: "2026-04-03",
          checkInLabel: "",
          checkOutLabel: "",
          dateRangeLabel: "",
          nightCount: 2,
          usesGoogleAttribution: false,
        },
      ],
      activities: [],
      dayTransports: [],
      transportRecords: new Map(),
    });
    expect(candidates[0]?.query).toBe("Rome");
    expect(JSON.stringify(candidates)).not.toContain("Japan");
  });
});

describe("Globalization Phase 1 — weather seed", () => {
  it("uses trip coordinates and never Tokyo fallback", () => {
    const rome = resolveWeatherSeedFromDestination({
      displayName: "Rome",
      country: "Italy",
      latitude: 41.9028,
      longitude: 12.4964,
    });
    expect(rome?.label).toBe("Rome");
    expect(rome?.latitude).toBeCloseTo(41.9028);

    expect(
      resolveWeatherSeedFromDestination({
        displayName: "Trip",
        country: "Italy",
      }),
    ).toBeNull();
  });
});

describe("Globalization Phase 1 — transport timezone defaults", () => {
  it("uses trip calendar zone when supported", () => {
    expect(resolveDefaultTransportTimezone("Asia/Tokyo")).toBe("Asia/Tokyo");
    expect(resolveDefaultTransportTimezone("Europe/Paris")).toBe("Europe/Paris");
  });

  it("does not default Italy trips to Asia/Tokyo", () => {
    expect(resolveDefaultTransportTimezone("Europe/Rome")).toBe("UTC");
    expect(resolveDefaultTransportTimezone("Europe/Rome")).not.toBe("Asia/Tokyo");
  });
});

describe("Globalization Phase 1 — lists seed profiles", () => {
  it("adds JP overlay only for Japan", () => {
    const tEn = createAppTranslator("Lists", "en");
    const italy = buildListSeedItems("IT", tEn);
    const japan = buildListSeedItems("JP", tEn);
    expect(japan.length).toBeGreaterThan(italy.length);
    expect(italy.some((item) => item.text.toLowerCase().includes("suica"))).toBe(false);
    expect(japan.some((item) => item.text.toLowerCase().includes("suica"))).toBe(true);
  });

  it("uses generic baseline for missing country", () => {
    const tHe = createAppTranslator("Lists", "he");
    const items = buildListSeedItems(undefined, tHe);
    expect(items.some((item) => item.text.includes("Suica"))).toBe(false);
    expect(items[0]?.text).toBe("דרכון");
  });
});

describe("Globalization Phase 1 — places display language", () => {
  it("resolves JP and KR and neutral default", () => {
    expect(resolvePlacesDisplayLanguageCode("JP")).toBe("ja");
    expect(resolvePlacesDisplayLanguageCode("KR")).toBe("ko");
    expect(resolvePlacesDisplayLanguageCode("IT")).toBe("en");
    expect(resolvePlacesDisplayLanguageCode(undefined)).toBe("en");
  });
});

describe("Globalization Phase 1 — currency neutral bootstrap", () => {
  it("does not pick JPY as neutral converter from", () => {
    const currencies = [
      { code: "JPY" },
      { code: "ILS" },
      { code: "USD" },
      { code: "EUR" },
    ];
    expect(resolveNeutralConverterFromCurrency(currencies, "ILS")).toBe("USD");
  });
});

describe("Globalization Phase 1 — guardrails (no universal Japan defaults)", () => {
  const phase1Sources = [
    "src/features/weather/queries.ts",
    "src/features/weather/constants.ts",
    "src/features/currency/queries.ts",
    "src/features/currency/constants.ts",
    "src/features/transport/transport-form-defaults.ts",
    "src/features/lists/list-domain.ts",
    "src/features/places/constants.ts",
    "src/features/itinerary/resolve-day-location-candidates.ts",
    "src/features/itinerary/resolve-day-location.server.ts",
  ];

  it("Phase 1 core sources do not hardcode universal Tokyo/JPY/ja defaults", () => {
    for (const relativePath of phase1Sources) {
      const source = readFileSync(join(root, relativePath), "utf8");
      expect(source, relativePath).not.toMatch(/DEFAULT_WEATHER_LOCATION/);
      expect(source, relativePath).not.toMatch(/DEFAULT_FROM_CURRENCY\s*=\s*"JPY"/);
      expect(source, relativePath).not.toMatch(/getDefaultJapanTransportTimezone/);
      expect(source, relativePath).not.toMatch(/PLACES_DISPLAY_LANGUAGE_CODE\s*=\s*"ja"/);
      expect(source, relativePath).not.toContain('country ?? "Japan"');
      expect(source, relativePath).not.toContain("`, Japan`");
    }
  });
});
