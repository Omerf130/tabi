import { describe, expect, it } from "vitest";
import { createHebrewHomeTranslations } from "@/features/i18n/test-translators";
import {
  buildAfterTripDurationLabel,
  resolveAfterTripIdentityLabel,
} from "./build-after-trip-hero";

const tHome = createHebrewHomeTranslations().tHome;

describe("buildAfterTripHero", () => {
  it("uses destination display name for identity when available", () => {
    expect(
      resolveAfterTripIdentityLabel("יפן 2026", {
        displayName: "Japan",
        country: "Japan",
      }),
    ).toBe("Japan");
  });

  it("falls back to trip name for identity when destination is missing", () => {
    expect(resolveAfterTripIdentityLabel("Italy Summer", null)).toBe("Italy Summer");
  });

  it("builds inclusive trip duration from canonical trip-day count", () => {
    expect(
      buildAfterTripDurationLabel(
        "2026-10-25",
        "2026-11-18",
        tHome,
        {
          displayName: "Japan",
          country: "Japan",
        },
      ),
    ).toBe("25 ימים בJapan");
  });

  it("does not hardcode Japan when destination differs", () => {
    const label = buildAfterTripDurationLabel(
      "2026-10-25",
      "2026-11-18",
      tHome,
      {
        displayName: "Rome",
        country: "Italy",
      },
      "Italy Summer",
    );

    expect(label).toBe("25 ימים בItaly");
    expect(label).not.toContain("Japan");
    expect(label).not.toContain("יפן");
  });

  it("uses trip name for duration place when destination is unavailable", () => {
    expect(
      buildAfterTripDurationLabel(
        "2026-10-25",
        "2026-10-27",
        tHome,
        undefined,
        "Portugal Escape",
      ),
    ).toBe("3 ימים בPortugal Escape");
  });
});
