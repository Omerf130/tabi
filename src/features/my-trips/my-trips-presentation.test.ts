import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CREATE_TRIP_PATH,
  MY_TRIPS_FALLBACK_VISUAL,
  MY_TRIPS_HERO_VISUAL,
} from "./constants";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readSource(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("my trips presentation contracts", () => {
  it("uses a neutral global hero visual (not Japan-specific)", () => {
    expect(MY_TRIPS_HERO_VISUAL).toBe(MY_TRIPS_FALLBACK_VISUAL);
    expect(MY_TRIPS_HERO_VISUAL).not.toContain("japan.png");
    expect(MY_TRIPS_HERO_VISUAL).not.toContain("blob:");
  });

  it("keeps hero copy and removes the old page intro block", () => {
    const screen = readSource("features/my-trips/MyTripsScreen.tsx");
    const hero = readSource("features/my-trips/MyTripsHero.tsx");

    expect(hero).toContain('getTranslations("MyTrips")');
    expect(screen).not.toContain("pageIntro");
    expect(screen).not.toContain("Your personal collection of journeys.");
    expect(screen).not.toContain('dir="ltr"');
  });

  it("implements All, Upcoming, and Past filters without Saved", () => {
    const filterBar = readSource("features/my-trips/MyTripsFilterBar.tsx");
    const messages = readFileSync(join(root, "../messages/en.json"), "utf8");

    expect(filterBar).toContain('aria-pressed={isSelected}');
    expect(filterBar).toContain('useTranslations("MyTrips.filters")');
    expect(messages).toContain('"all": "All"');
    expect(messages).toContain('"upcoming": "Upcoming"');
    expect(messages).toContain('"past": "Past"');
    expect(filterBar).not.toContain("Saved");
  });

  it("uses local UI-only filter state without URL or database persistence", () => {
    const content = readSource("features/my-trips/MyTripsContent.client.tsx");
    const filterLogic = readSource("features/my-trips/filter-my-trips.ts");

    expect(content).toContain("useState");
    expect(content).toContain("filterMyTripsCards");
    expect(content).not.toContain("useSearchParams");
    expect(filterLogic).not.toContain("fetch(");
  });

  it("routes create actions through the existing create trip flow", () => {
    const filterBar = readSource("features/my-trips/MyTripsFilterBar.tsx");
    const emptyState = readSource("features/my-trips/MyTripsEmptyState.tsx");
    const messages = readFileSync(join(root, "../messages/en.json"), "utf8");

    expect(CREATE_TRIP_PATH).toBe("/app/trips/new");
    expect(filterBar).toContain('useTranslations("MyTrips.createTrip")');
    expect(filterBar).toContain("CREATE_TRIP_PATH");
    expect(messages).toContain("Plan Your First Trip");
    expect(emptyState).toContain("CREATE_TRIP_PATH");
  });

  it("preserves trip card navigation and destination visual resolver usage", () => {
    const card = readSource("features/my-trips/TripCollectionCard.tsx");
    const builder = readSource("features/my-trips/build-my-trips-cards.ts");

    expect(card).toContain("/app/trips/${trip.id}");
    expect(card).toContain("unoptimized={trip.hasPersistedCover}");
    expect(card).toContain("formatAppDate");
    expect(builder).toContain("resolveTripCardVisual");
    expect(builder).toContain("coverVisualKey");
  });

  it("removes phase section grouping and prominent role labels from cards", () => {
    const library = readSource("features/my-trips/TripLibraryGrid.tsx");
    const card = readSource("features/my-trips/TripCollectionCard.tsx");
    const screen = readSource("features/my-trips/MyTripsScreen.tsx");

    expect(library).toBeTruthy();
    expect(card).not.toContain("MY_TRIPS_ROLE_LABELS");
    expect(card).not.toContain("Owner");
    expect(screen).not.toContain("TripCollectionGrid");
    expect(screen).not.toContain("collectionSectionTitle");
  });

  it("does not introduce Saved, Explore, or a trip status field", () => {
    const screenDir = [
      "features/my-trips/MyTripsScreen.tsx",
      "features/my-trips/MyTripsContent.client.tsx",
      "features/my-trips/MyTripsFilterBar.tsx",
      "features/my-trips/constants.ts",
    ]
      .map((path) => readSource(path))
      .join("\n");

    expect(screenDir).not.toContain("Explore");
    expect(screenDir).not.toMatch(/\bSaved\b/);
    expect(screenDir).not.toContain("tripStatus");
  });

  it("provides contextual empty states for each filter", () => {
    const emptyState = readSource("features/my-trips/MyTripsEmptyState.tsx");
    const messages = readFileSync(join(root, "../messages/en.json"), "utf8");

    expect(emptyState).toContain("filter: MyTripsFilter");
    expect(readSource("features/my-trips/MyTripsContent.client.tsx")).toContain(
      "<MyTripsEmptyState filter={activeFilter}",
    );
    expect(messages).toContain("No trips yet");
    expect(messages).toContain("No upcoming trips");
    expect(messages).toContain("No past trips yet");
  });

  it("keeps account affordance in the hero", () => {
    const hero = readSource("features/my-trips/MyTripsHero.tsx");
    const account = readSource("features/my-trips/MyTripsAccountAffordance.tsx");

    expect(hero).toContain("MyTripsAccountAffordance");
    expect(account).toContain("LogoutWithPushCleanup");
    expect(account).toContain("buildProfileHrefWithReturnTo");
    expect(account).toContain('useTranslations("MyTrips.account")');
  });
});
