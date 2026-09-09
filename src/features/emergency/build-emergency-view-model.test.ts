import { describe, expect, it } from "vitest";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { CURATED_EMERGENCY_PHRASE_IDS } from "./constants";
import { getPhraseFromDefaultPack } from "@/features/language/builtin/registry";
import { buildEmergencyViewModel } from "./build-emergency-view-model";

const tripId = "507f1f77bcf86cd799439011";

function makeAccommodation(
  overrides: Partial<AccommodationViewModel> = {},
): AccommodationViewModel {
  return {
    id: "acc-1",
    tripId,
    placeSource: "manual",
    name: "Hotel Example",
    city: "Tokyo",
    checkInDate: "2026-10-25",
    checkOutDate: "2026-10-28",
    checkInLabel: "25 Oct 2026",
    checkOutLabel: "28 Oct 2026",
    dateRangeLabel: "25 Oct – 28 Oct 2026",
    nightCount: 3,
    usesGoogleAttribution: false,
    googleMapsUrl: "https://maps.google.com/example",
    addressEnglish: "1-1 Example",
    ...overrides,
  };
}

describe("buildEmergencyViewModel", () => {
  it("includes urgent and assistance resources", () => {
    const model = buildEmergencyViewModel({
      tripId,
      startDate: "2026-10-25",
      endDate: "2026-11-18",
      accommodations: [],
      customResources: [],
      emergencyDocuments: [],
    });

    expect(model.urgentResources.map((resource) => resource.phone)).toEqual(["110", "119"]);
    expect(model.assistanceResources.length).toBeGreaterThan(0);
  });

  it("shows current accommodation only for occupied stay", () => {
    const current = buildEmergencyViewModel({
      tripId,
      startDate: "2026-10-25",
      endDate: "2026-11-18",
      accommodations: [makeAccommodation()],
      customResources: [],
      emergencyDocuments: [],
      todayJapan: "2026-10-26",
    });

    expect(current.currentAccommodation?.name).toBe("Hotel Example");

    const upcoming = buildEmergencyViewModel({
      tripId,
      startDate: "2026-11-01",
      endDate: "2026-11-18",
      accommodations: [makeAccommodation({ checkInDate: "2026-11-05" })],
      customResources: [],
      emergencyDocuments: [],
      todayJapan: "2026-10-26",
    });

    expect(upcoming.currentAccommodation).toBeNull();
  });

  it("links curated emergency phrases", () => {
    const model = buildEmergencyViewModel({
      tripId,
      startDate: "2026-10-25",
      endDate: "2026-11-18",
      accommodations: [],
      customResources: [],
      emergencyDocuments: [],
    });

    for (const phraseId of CURATED_EMERGENCY_PHRASE_IDS) {
      expect(getPhraseFromDefaultPack(phraseId)).toBeDefined();
    }

    expect(model.phraseLinks).toHaveLength(CURATED_EMERGENCY_PHRASE_IDS.length);
    expect(model.phraseLinks[0]?.detailHref).toContain(`/language/${model.phraseLinks[0]?.id}`);
  });
});
