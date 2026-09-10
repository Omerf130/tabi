import { describe, expect, it } from "vitest";
import { resolveTripVisualSrc } from "@/features/destination-visuals/resolve-trip-visual-src";
import { AFTER_SURFACE_SECTION_ORDER } from "./AfterTripJourney";
import { buildTripHomeViewModel } from "./build-trip-home-view-model";

const trip = {
  id: "507f1f77bcf86cd799439011",
  name: "Italy Summer",
  startDate: "2026-10-25",
  endDate: "2026-11-18",
};

describe("after trip home", () => {
  it("defines the after surface section order", () => {
    expect(AFTER_SURFACE_SECTION_ORDER).toEqual(["memories", "itineraryRevisit"]);
  });

  it("uses canonical trip visual for completed hero", () => {
    const visual = resolveTripVisualSrc({
      tripId: trip.id,
      hasCoverImage: true,
      coverVisualKey: "japan-01",
    });

    const model = buildTripHomeViewModel({
      trip: {
        ...trip,
        coverImage: { pathname: "cover.jpg", contentType: "image/jpeg" },
        coverVisualKey: "japan-01",
      },
      todayJapan: "2026-12-01",
      nowJapanTime: "10:00",
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
      trip: {
        ...trip,
        destination: {
          displayName: "Rome",
          country: "Italy",
        },
      },
      todayJapan: "2026-12-01",
      nowJapanTime: "10:00",
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

  it("links memories and itinerary revisit to real routes", () => {
    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-12-01",
      nowJapanTime: "10:00",
    });

    expect(model.phase).toBe("completed");
    if (model.phase !== "completed") {
      return;
    }

    expect(model.memories.href).toBe(
      "/app/trips/507f1f77bcf86cd799439011/memories",
    );
    expect(model.itineraryRevisit.href).toBe(
      "/app/trips/507f1f77bcf86cd799439011/itinerary",
    );
  });

  it("does not render finance, highlights, or fake memories data", () => {
    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-12-01",
      nowJapanTime: "10:00",
    });

    expect(model.phase).toBe("completed");
    if (model.phase !== "completed") {
      return;
    }

    expect(model).not.toHaveProperty("finance");
    expect(model).not.toHaveProperty("highlights");
    expect(model.memories).toEqual({
      href: "/app/trips/507f1f77bcf86cd799439011/memories",
      title: "זיכרונות",
      description: "הרגעים מהטיול יחכו לך כאן.",
    });
    expect(model.memories).not.toHaveProperty("photoCount");
    expect(model.memories).not.toHaveProperty("gallery");
    expect(model.memories).not.toHaveProperty("statistics");
  });

  it("keeps before and during view models unchanged", () => {
    const before = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-10-01",
      nowJapanTime: "10:00",
    });

    const during = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-11-01",
      nowJapanTime: "13:00",
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
