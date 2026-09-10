import { existsSync, readFileSync } from "node:fs";

import { dirname, join } from "node:path";

import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { buildAccommodationListHref } from "@/features/accommodations/constants";

import { getActiveNavSection } from "@/features/app-shell/navigation";

import { buildFinanceHref } from "@/features/finance/constants";

import { buildTravelHubViewModel } from "./build-travel-hub-view-model";

import { TRAVEL_TOOLS } from "./constants";



const tripId = "507f1f77bcf86cd799439011";

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

const featureRoot = dirname(fileURLToPath(import.meta.url));



describe("travel hub presentation", () => {

  it("keeps all 8 real travel tools in grid order", () => {

    expect(TRAVEL_TOOLS.map((tool) => tool.id)).toEqual([

      "accommodations",

      "lists",

      "currency",

      "transport",

      "weather",

      "language",

      "manage",

      "emergency",

    ]);

    expect(TRAVEL_TOOLS.every((tool) => tool.description.length > 0)).toBe(true);

  });



  it("does not include a maps tool", () => {

    expect(TRAVEL_TOOLS.some((tool) => tool.id.includes("map"))).toBe(false);

    expect(TRAVEL_TOOLS.some((tool) => tool.label.includes("מפות"))).toBe(false);

  });



  it("renders live finance summary card linked to Finance route", () => {
    const source = readFileSync(join(featureRoot, "FinanceSummaryCard.tsx"), "utf8");

    expect(source).toContain("<Link");
    expect(source).toContain("finance.href");
    expect(source).not.toContain("בקרוב");
  });

  it("keeps finance out of the travel tools grid while the summary card remains", () => {
    expect(TRAVEL_TOOLS.map((tool) => tool.id)).not.toContain("finance");
    expect(
      existsSync(join(process.cwd(), "src/app/app/trips/[tripId]/finance")),
    ).toBe(true);
  });



  it("preserves existing tool hrefs", () => {

    const model = buildTravelHubViewModel({
      trip: {
        id: tripId,
        name: "Japan 2026",
        startDate: "2026-10-25",
        endDate: "2026-11-18",
      },
      accommodations: [],
      lists: [],
      todayJapan: "2026-10-01",
      finance: emptyFinance,
    });

    const hrefById = Object.fromEntries(model.tools.map((tool) => [tool.id, tool.href]));



    expect(hrefById.accommodations).toBe(`/app/trips/${tripId}/accommodations`);

    expect(hrefById.lists).toBe(`/app/trips/${tripId}/lists`);

    expect(hrefById.currency).toBe(`/app/trips/${tripId}/currency`);

    expect(hrefById.transport).toBe(`/app/trips/${tripId}/transport`);

    expect(hrefById.weather).toBe(`/app/trips/${tripId}/weather`);

    expect(hrefById.language).toBe(`/app/trips/${tripId}/language`);

    expect(hrefById.manage).toBe(`/app/trips/${tripId}/manage`);

    expect(hrefById.emergency).toBe(`/app/trips/${tripId}/emergency`);

  });



  it("preserves contextual accommodation behavior and list-all href", () => {

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
      lists: [],
      todayJapan: "2026-10-01",
      finance: emptyFinance,
    });



    expect(model.contextualAccommodation?.title).toBe("הלינה הבאה שלך");

    expect(model.contextualAccommodation?.listHref).toBe(

      buildAccommodationListHref(tripId),

    );

  });



  it("uses real preparation progress data for attention list", () => {

    const model = buildTravelHubViewModel({
      trip: {
        id: tripId,
        name: "Japan 2026",
        startDate: "2026-10-25",
        endDate: "2026-11-18",
      },
      accommodations: [],
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
      todayJapan: "2026-10-01",
      finance: emptyFinance,
    });



    expect(model.attentionList?.list.progressLabel).toBe("3 מתוך 8 הושלמו");

    expect(model.attentionList?.remainingCount).toBe(5);

  });



  it("builds my trip card from canonical trip visual and real duration", () => {

    const model = buildTravelHubViewModel({
      trip: {
        id: tripId,
        name: "Japan 2026",
        startDate: "2026-10-25",
        endDate: "2026-11-18",
        coverVisualKey: "japan-01",
      },
      accommodations: [],
      lists: [],
      todayJapan: "2026-12-01",
      finance: emptyFinance,
    });

    expect(model.myTrip.href).toBe(`/app/trips/${tripId}`);
    expect(model.myTrip.metaLabel).toBe("25 ימים • טיול הושלם");
    expect(model.myTrip.statusLabel).toBe("טיול הושלם");

    expect(model.hero.heroImageSrc).toBeTruthy();

  });



  it("keeps more active in navigation", () => {

    expect(getActiveNavSection(`/app/trips/${tripId}/more`, tripId)).toBe("more");

  });

});


