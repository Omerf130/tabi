import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), "src", relativePath), "utf8");
}

describe("ES3 production empty state migration", () => {
  it("Itinerary separates overview first-use from day timeline empty", () => {
    const overview = readSource("features/itinerary/ItineraryPageContent.tsx");
    const timeline = readSource("features/itinerary/DayTimeline.client.tsx");

    expect(overview).toContain("ItineraryOverviewEmpty");
    expect(overview).toContain("hasAnyScheduledContent");
    expect(timeline).toContain('visualDensity="compact"');
    expect(timeline).toContain("dayTimelineEmptyTitle");
  });

  it("Finance uses shared empty states without replacing budget zero display", () => {
    const finance = readSource("features/finance/FinancePageContent.tsx");

    expect(finance).toContain("FinanceExpensesEmpty");
    expect(finance).toContain("budgetPrimaryMuted");
    expect(finance).toContain("formatCurrencyAmount(summary.totalExpenses");
  });

  it("Lists shows list-level empty while keeping add form", () => {
    const checklist = readSource("features/lists/ListChecklist.client.tsx");

    expect(checklist).toContain("ListChecklistEmpty");
    expect(checklist).toContain("addForm");
    expect(checklist).toContain("optimisticItems.length === 0");
  });

  it("Reminders manager distinguishes filter miss from no reminders", () => {
    const manager = readSource("features/trip-home/TripHomeRemindersManager.client.tsx");
    const journey = readSource("features/trip-home/BeforeTripJourney.tsx");

    expect(manager).toContain("isFilterMiss");
    expect(manager).toContain('variant="search"');
    expect(manager).toContain('variant="section"');
    expect(journey).toContain("journey.upcomingReminders ?");
  });

  it("Currency separates config, provider failure, and search empty", () => {
    const converter = readSource("features/currency/CurrencyConverter.client.tsx");
    const picker = readSource("features/currency/CurrencyPickerList.client.tsx");

    expect(converter).toContain("ConfigNotice");
    expect(converter).toContain("ProviderAlert");
    expect(converter).not.toContain("styles.errorBlock");
    expect(picker).toContain('variant="search"');
  });

  it("Travel Hub keeps toolbox rows without large empty state blocks", () => {
    const hub = readSource("features/travel-hub/TravelHubContent.tsx");

    expect(hub).not.toContain("EmptyState");
    expect(hub).toContain("TravelHubPrimaryRow");
  });
});
