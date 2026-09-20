import { describe, expect, it } from "vitest";
import { createHebrewHomeTranslations } from "@/features/i18n/test-translators";
import { buildTestNoExpensesRecap } from "@/features/finance/after-trip-finance-recap-fixture";
import { resolveTripVisualSrc } from "@/features/destination-visuals/resolve-trip-visual-src";
import { AFTER_SURFACE_SECTION_ORDER } from "./AfterTripJourney";
import { buildTripHomeViewModel } from "./build-trip-home-view-model";

const trip = {
  id: "507f1f77bcf86cd799439011",
  name: "Italy Summer",
  startDate: "2026-10-25",
  endDate: "2026-11-18",
};

const translations = createHebrewHomeTranslations();

describe("after trip home", () => {
  it("defines the after surface section order", () => {
    expect(AFTER_SURFACE_SECTION_ORDER).toEqual([
      "tripSummary",
      "financeRecap",
      "itineraryRevisit",
    ]);
    expect(AFTER_SURFACE_SECTION_ORDER).not.toContain("memories");
  });

  it("uses canonical trip visual for completed hero", () => {
    const visual = resolveTripVisualSrc({
      tripId: trip.id,
      hasCoverImage: true,
      coverVisualKey: "japan-01",
    });

    const model = buildTripHomeViewModel({
      translations,
      trip: {
        ...trip,
        coverImage: { pathname: "cover.jpg", contentType: "image/jpeg" },
        coverVisualKey: "japan-01",
      },
      todayTripLocal: "2026-12-01",
      nowTripLocal: "10:00",
      financeRecap: buildTestNoExpensesRecap(),
    });

    expect(model.phase).toBe("completed");
    if (model.phase !== "completed") {
      return;
    }

    expect(model.hero.heroImageSrc).toBe(visual.imageSrc);
    expect(model.hero.hasPersistedCover).toBe(true);
  });

  it("uses real inclusive trip duration without hardcoded Japan", () => {
    const model = buildTripHomeViewModel({
      translations,
      trip: {
        ...trip,
        destination: {
          displayName: "Rome",
          country: "Italy",
        },
      },
      todayTripLocal: "2026-12-01",
      nowTripLocal: "10:00",
      financeRecap: buildTestNoExpensesRecap(),
    });

    expect(model.phase).toBe("completed");
    if (model.phase !== "completed") {
      return;
    }

    expect(model.hero.durationLabel).toBe("25 ימים בItaly");
    expect(model.hero.tripIdentityLabel).toBe("Rome");
    expect(model.hero.durationLabel).not.toContain("Japan");
    expect(model.hero.durationLabel).not.toContain("יפן");
  });

  it("links itinerary revisit to the real route", () => {
    const model = buildTripHomeViewModel({
      trip,
      translations,
      todayTripLocal: "2026-12-01",
      nowTripLocal: "10:00",
      financeRecap: buildTestNoExpensesRecap(),
    });

    expect(model.phase).toBe("completed");
    if (model.phase !== "completed") {
      return;
    }

    expect(model.itineraryRevisit.href).toBe(
      "/app/trips/507f1f77bcf86cd799439011/itinerary",
    );
    expect(model).not.toHaveProperty("memories");
  });

  it("includes finance recap and avoids highlights", () => {
    const model = buildTripHomeViewModel({
      trip,
      translations,
      todayTripLocal: "2026-12-01",
      nowTripLocal: "10:00",
      financeRecap: buildTestNoExpensesRecap(),
    });

    expect(model.phase).toBe("completed");
    if (model.phase !== "completed") {
      return;
    }

    expect(model.financeRecap.variant).toBe("noExpenses");
    expect(model).not.toHaveProperty("highlights");
    expect(model).not.toHaveProperty("memories");
  });

  it("keeps before and during view models unchanged", () => {
    const before = buildTripHomeViewModel({
      trip,
      translations,
      todayTripLocal: "2026-10-01",
      nowTripLocal: "10:00",
    });

    const during = buildTripHomeViewModel({
      trip,
      translations,
      todayTripLocal: "2026-11-01",
      nowTripLocal: "13:00",
    });

    expect(before.phase).toBe("upcoming");
    expect(during.phase).toBe("active");
    if (before.phase !== "upcoming" || during.phase !== "active") {
      return;
    }

    expect(before.beforeJourney).toBeDefined();
    expect(during.todaysPlan).toBeDefined();
    expect(before).not.toHaveProperty("memories");
    expect(during).not.toHaveProperty("memories");
  });
});
