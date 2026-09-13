import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CREATE_TRIP_PATH, MY_TRIPS_HERO_VISUAL } from "./constants";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readSource(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("my trips presentation contracts", () => {
  it("uses an existing destination visual for the hero", () => {
    expect(MY_TRIPS_HERO_VISUAL).toBe("/destination-visuals/japan.png");
    expect(MY_TRIPS_HERO_VISUAL).not.toContain("blob:");
  });

  it("keeps hero copy and removes the old page intro block", () => {
    const screen = readSource("features/my-trips/MyTripsScreen.tsx");
    const hero = readSource("features/my-trips/MyTripsHero.tsx");

    expect(hero).toContain("Your adventures, all in one place.");
    expect(screen).not.toContain("pageIntro");
    expect(screen).not.toContain("Your personal collection of journeys.");
  });

  it("implements All, Upcoming, and Past filters without Saved", () => {
    const filterBar = readSource("features/my-trips/MyTripsFilterBar.tsx");
    const constants = readSource("features/my-trips/constants.ts");

    expect(filterBar).toContain('aria-pressed={isSelected}');
    expect(constants).toContain('"All"');
    expect(constants).toContain('"Upcoming"');
    expect(constants).toContain('"Past"');
    expect(constants).not.toContain("Saved");
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

    expect(CREATE_TRIP_PATH).toBe("/app/trips/new");
    expect(filterBar).toContain('aria-label="Create new trip"');
    expect(filterBar).toContain("CREATE_TRIP_PATH");
    expect(readSource("features/my-trips/constants.ts")).toContain("Plan Your First Trip");
    expect(emptyState).toContain("CREATE_TRIP_PATH");
  });

  it("preserves trip card navigation and destination visual resolver usage", () => {
    const card = readSource("features/my-trips/TripCollectionCard.tsx");
    const builder = readSource("features/my-trips/build-my-trips-cards.ts");

    expect(card).toContain("/app/trips/${trip.id}");
    expect(card).toContain("unoptimized={trip.hasPersistedCover}");
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
    const constants = readSource("features/my-trips/constants.ts");

    expect(emptyState).toContain("filter: MyTripsFilter");
    expect(readSource("features/my-trips/MyTripsContent.client.tsx")).toContain(
      "<MyTripsEmptyState filter={activeFilter}",
    );
    expect(constants).toContain("No trips yet");
    expect(constants).toContain("No upcoming trips");
    expect(constants).toContain("No past trips yet");
  });

  it("keeps account affordance in the hero", () => {
    const hero = readSource("features/my-trips/MyTripsHero.tsx");
    const account = readSource("features/my-trips/MyTripsAccountAffordance.tsx");

    expect(hero).toContain("MyTripsAccountAffordance");
    expect(account).toContain("logoutAction");
    expect(account).toContain('aria-label="Account menu"');
  });
});
