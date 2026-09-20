import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), "src", relativePath), "utf8");
}

function readMessages(locale: "en" | "he"): string {
  return readFileSync(join(process.cwd(), "messages", `${locale}.json`), "utf8");
}

describe("ES5 empty states project closure", () => {
  it("removes dead legacy selectors identified in ES5A", () => {
    const tripCoverScss = readSource("features/trips/cover/TripCoverSettings.module.scss");
    const tripHomeScss = readSource("features/trip-home/TripHomeContent.module.scss");

    expect(tripCoverScss).not.toMatch(/\.empty\s*\{/);
    expect(tripCoverScss).toContain(".hint {");
    expect(tripHomeScss).not.toContain(".planEmpty");
  });

  it("removes orphan empty-state i18n keys identified in ES5A", () => {
    for (const locale of ["en", "he"] as const) {
      const messages = readMessages(locale);
      expect(messages).not.toContain('"emptyDay"');
      expect(messages).not.toMatch(/"TripCover"[\s\S]*"empty": "No trip photo/);
      expect(messages).not.toMatch(/"TripCover"[\s\S]*"empty": "עדיין לא נבחרה/);
    }
  });

  it("keeps shared empty state primitives available for production", () => {
    const index = readSource("components/ui/EmptyState/index.ts");
    expect(index).toContain("EmptyState");
    expect(readSource("components/ui/ConfigNotice/ConfigNotice.tsx")).toContain("ConfigNotice");
    expect(readSource("components/ui/ProviderAlert/ProviderAlert.tsx")).toContain("ProviderAlert");
  });

  it("does not migrate combobox surfaces to EmptyState in ES5B", () => {
    const placeSearch = readSource("features/places/PlaceSearchField.tsx");
    const destinationSearch = readSource("features/create-trip/DestinationSearchField.tsx");

    const placeAutocomplete = readSource("features/places/use-place-autocomplete-search.ts");

    expect(placeSearch).not.toContain("EmptyState");
    expect(destinationSearch).not.toContain("EmptyState");
    expect(placeAutocomplete).toContain("noResults");
    expect(destinationSearch).toContain("noResults");
  });

  it("preserves established Home hide/show decisions", () => {
    const beforeJourney = readSource("features/trip-home/BeforeTripJourney.tsx");
    const duringJourney = readSource("features/trip-home/DuringTripJourney.tsx");
    const todaySummary = readSource("features/trip-home/DuringTodaySummary.tsx");
    const emergencyActions = readSource("features/emergency/EmergencyResourceActions.tsx");

    expect(beforeJourney).toContain("journey.upcomingReminders ?");
    expect(beforeJourney).toContain("preparation.listTiles.length === 0");
    expect(duringJourney).toContain("model.importantToday ?");
    expect(duringJourney).toContain("model.now ?");
    expect(duringJourney).toContain("model.upNext ?");
    expect(todaySummary).toContain("items.length === 0");
    expect(emergencyActions).toContain("actions.length === 0");
  });
});
