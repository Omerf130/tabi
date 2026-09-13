import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildAccommodationListHref } from "@/features/accommodations/constants";
import { getActiveNavSection } from "@/features/app-shell/navigation";
import { buildFinanceHref } from "@/features/finance/constants";
import { createHebrewTravelHubTranslators } from "@/features/i18n/test-translators";
import { buildTravelHubViewModel } from "./build-travel-hub-view-model";
import { TRAVEL_HUB_QUICK_TOOLS } from "./constants";

const tripId = "507f1f77bcf86cd799439011";
const travelHubTranslators = createHebrewTravelHubTranslators();
const featureRoot = dirname(fileURLToPath(import.meta.url));

const emptyFinance = {
  href: buildFinanceHref(tripId),
  hasBudget: false,
  hasExpenses: false,
  baseCurrency: "ILS",
  totalExpenses: 0,
  budgetAmount: null,
  remainingBudget: null,
  percentConsumed: null,
};

describe("travel hub presentation", () => {
  it("uses quick tools instead of a uniform nine-tile grid", () => {
    expect(TRAVEL_HUB_QUICK_TOOLS.map((tool) => tool.id)).toEqual([
      "currency",
      "weather",
      "language",
      "emergency",
    ]);
    expect(TRAVEL_HUB_QUICK_TOOLS.every((tool) => tool.colorClass.length > 0)).toBe(
      true,
    );
    const model = buildTravelHubViewModel({
      trip: {
        id: tripId,
        name: "Japan 2026",
        startDate: "2026-10-25",
        endDate: "2026-11-18",
      },
      accommodations: [],
      transports: [],
      lists: [],
      documentCount: 0,
      currentTripDate: "2026-10-01",
      finance: emptyFinance,
      ...travelHubTranslators,
    });
    expect(model.quickTools.every((tool) => tool.description.length > 0)).toBe(true);
  });

  it("renders live finance summary card linked to Finance route", () => {
    const source = readFileSync(join(featureRoot, "FinanceSummaryCard.tsx"), "utf8");

    expect(source).toContain("<Link");
    expect(source).toContain("finance.href");
    expect(source).not.toContain("בקרוב");
  });

  it("preserves canonical destination hrefs", () => {
    const model = buildTravelHubViewModel({
      trip: {
        id: tripId,
        name: "Japan 2026",
        startDate: "2026-10-25",
        endDate: "2026-11-18",
      },
      accommodations: [],
      transports: [],
      lists: [],
      documentCount: 0,
      currentTripDate: "2026-10-01",
      finance: emptyFinance,
      ...travelHubTranslators,
    });

    expect(model.accommodation.href).toBe(`/app/trips/${tripId}/accommodations`);
    expect(model.materials.lists.href).toBe(`/app/trips/${tripId}/lists`);
    expect(model.quickTools.find((tool) => tool.id === "currency")?.href).toBe(
      `/app/trips/${tripId}/currency`,
    );
    expect(model.transport.href).toBe(`/app/trips/${tripId}/transport`);
    expect(model.quickTools.some((tool) => tool.id === "currency")).toBe(true);
    expect(model.quickTools.find((tool) => tool.id === "weather")?.href).toBe(
      `/app/trips/${tripId}/weather`,
    );
    expect(model.quickTools.find((tool) => tool.id === "language")?.href).toBe(
      `/app/trips/${tripId}/language`,
    );
    expect(model.management.href).toBe(`/app/trips/${tripId}/manage`);
    expect(model.quickTools.find((tool) => tool.id === "emergency")?.href).toBe(
      `/app/trips/${tripId}/emergency`,
    );
  });

  it("does not use selectNextUpcomingTransport in transport row builder", () => {
    const source = readFileSync(
      join(featureRoot, "build-travel-hub-transport-row.ts"),
      "utf8",
    );

    expect(source).not.toContain("selectNextUpcomingTransport");
    expect(source).not.toContain("getJapanWallClockTime");
  });

  it("uses compact essentials layout in TravelHubContent", () => {
    const source = readFileSync(join(featureRoot, "TravelHubContent.tsx"), "utf8");

    expect(source).toContain("TravelHubPrimaryRow");
    expect(source).toContain("materialsGrid");
    expect(source).toContain("quickToolsGrid");
    expect(source).toContain("managementRow");
    expect(source).not.toContain("myTripCard");
    expect(source).not.toContain("toolsGrid");
  });

  it("preserves accommodation list href and populated detail", () => {
    const model = buildTravelHubViewModel({
      trip: {
        id: tripId,
        name: "Japan 2026",
        startDate: "2026-10-25",
        endDate: "2026-11-18",
      },
      accommodations: [
        {
          id: "acc-1",
          tripId,
          placeSource: "manual",
          name: "Hotel Gracery Shinjuku",
          city: "Shinjuku City",
          checkInDate: "2026-10-25",
          checkOutDate: "2026-10-28",
          checkInLabel: "25 Oct",
          checkOutLabel: "28 Oct",
          dateRangeLabel: "25 Oct – 28 Oct",
          nightCount: 3,
          usesGoogleAttribution: false,
        },
      ],
      transports: [],
      lists: [],
      documentCount: 0,
      currentTripDate: "2026-10-01",
      finance: emptyFinance,
      ...travelHubTranslators,
    });

    expect(model.accommodation.detailLine).toBe("הבא: Hotel Gracery Shinjuku");
    expect(model.accommodation.href).toBe(buildAccommodationListHref(tripId));
  });

  it("uses real preparation progress data for lists tile", () => {
    const model = buildTravelHubViewModel({
      trip: {
        id: tripId,
        name: "Japan 2026",
        startDate: "2026-10-25",
        endDate: "2026-11-18",
      },
      accommodations: [],
      transports: [],
      lists: [
        {
          type: "packing",
          slug: "packing",
          title: "אריזה",
          icon: "grid",
          progress: { totalCount: 8, completedCount: 3 },
          progressLabel: "3 מתוך 8 הושלמו",
        },
      ],
      documentCount: 0,
      currentTripDate: "2026-10-01",
      finance: emptyFinance,
      ...travelHubTranslators,
    });

    expect(model.materials.lists.secondaryLine).toBe("3 מתוך 8 הושלמו");
  });

  it("keeps more active in navigation", () => {
    expect(getActiveNavSection(`/app/trips/${tripId}/more`, tripId)).toBe("more");
  });
});
