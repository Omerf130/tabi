import { describe, expect, it } from "vitest";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { CURATED_EMERGENCY_PHRASE_IDS } from "./constants";
import { buildEmergencyViewModel } from "./build-emergency-view-model";

const tripId = "507f1f77bcf86cd799439011";
const t = createAppTranslator("Emergency", "he");
const tLanguage = createAppTranslator("Language", "he");

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

function baseInput(
  overrides: Partial<Parameters<typeof buildEmergencyViewModel>[0]> = {},
) {
  return {
    tripId,
    destinationCountryCode: "JP" as string | null | undefined,
    startDate: "2026-10-25",
    endDate: "2026-11-18",
    accommodations: [] as AccommodationViewModel[],
    customResources: [],
    emergencyDocuments: [],
    destinationCalendarTimeZone: "UTC",
    t,
    tLanguage,
    ...overrides,
  };
}

describe("buildEmergencyViewModel", () => {
  it("shows destination emergency services when country is set", () => {
    const model = buildEmergencyViewModel(baseInput({ destinationCountryCode: "JP" }));
    expect(model.verified.status).toBe("ready");
    if (model.verified.status === "ready") {
      expect(model.verified.services.map((s) => s.phone)).toEqual(["110", "119"]);
    }
  });

  it("does not show official numbers without destination", () => {
    const model = buildEmergencyViewModel(
      baseInput({ destinationCountryCode: null }),
    );
    expect(model.verified.status).toBe("missing_destination");
  });

  it("does not fall back to JP for US trips", () => {
    const model = buildEmergencyViewModel(baseInput({ destinationCountryCode: "US" }));
    expect(model.verified.status).toBe("ready");
    if (model.verified.status === "ready") {
      expect(model.verified.services.map((s) => s.phone)).toEqual(["911"]);
    }
  });

  it("does not include embassy or assistance built-ins", () => {
    const model = buildEmergencyViewModel(baseInput());
    const phones =
      model.verified.status === "ready"
        ? model.verified.services.flatMap((s) =>
            s.actions.filter((a) => a.type === "phone").map((a) => a.value),
          )
        : [];
    expect(phones).not.toContain(undefined);
    expect(JSON.stringify(model)).not.toMatch(/embassy|consular|JNTO/i);
  });

  it("preserves custom resources", () => {
    const model = buildEmergencyViewModel(
      baseInput({
        customResources: [
          {
            _id: { toString: () => "res-1" },
            tripId: { toString: () => tripId },
            category: "medical",
            title: "Clinic",
            phone: "555",
            createdBy: { toString: () => "user-1" },
          },
        ] as never,
      }),
    );
    expect(model.customResources).toHaveLength(1);
    expect(model.customResources[0]?.title).toBe("Clinic");
  });

  it("shows current accommodation only for occupied stay", () => {
    const current = buildEmergencyViewModel(
      baseInput({
        accommodations: [makeAccommodation()],
        todayTripLocal: "2026-10-26",
      }),
    );

    expect(current.currentAccommodation?.name).toBe("Hotel Example");
    expect(current.currentAccommodation?.mapsHref).toContain("google.com");

    const wazeModel = buildEmergencyViewModel(
      baseInput({
        accommodations: [makeAccommodation()],
        todayTripLocal: "2026-10-26",
        preferredMapsApp: "waze",
      }),
    );
    expect(wazeModel.currentAccommodation?.mapsHref).toContain("waze.com");

    const upcoming = buildEmergencyViewModel(
      baseInput({
        startDate: "2026-11-01",
        endDate: "2026-11-18",
        accommodations: [makeAccommodation({ checkInDate: "2026-11-05" })],
        todayTripLocal: "2026-10-26",
      }),
    );

    expect(upcoming.currentAccommodation).toBeNull();
  });

  it("links curated emergency phrases with UI-locale source labels", () => {
    const model = buildEmergencyViewModel(baseInput());
    expect(model.phraseLinks).toHaveLength(CURATED_EMERGENCY_PHRASE_IDS.length);
    expect(model.phraseLinks[0]?.sourceText.length).toBeGreaterThan(0);
    expect(model.phraseLinks[0]?.detailHref).toContain(
      `/language/${model.phraseLinks[0]?.id}`,
    );
  });

  it("only creates tel actions from validated official phones", () => {
    const model = buildEmergencyViewModel(baseInput({ destinationCountryCode: "JP" }));
    if (model.verified.status !== "ready") {
      throw new Error("expected ready");
    }
    for (const service of model.verified.services) {
      const phoneActions = service.actions.filter((a) => a.type === "phone");
      expect(phoneActions).toHaveLength(1);
      expect(phoneActions[0]?.href).toMatch(/^tel:/);
    }
  });
});
