import { describe, expect, it } from "vitest";
import {
  buildAfterTripDurationLabel,
  resolveAfterTripIdentityLabel,
} from "./build-after-trip-hero";

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
      buildAfterTripDurationLabel("2026-10-25", "2026-11-18", {
        displayName: "Japan",
        country: "Japan",
      }),
    ).toBe("25 ימים בJapan");
  });

  it("does not hardcode Japan when destination differs", () => {
    const label = buildAfterTripDurationLabel(
      "2026-10-25",
      "2026-11-18",
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
      buildAfterTripDurationLabel("2026-10-25", "2026-10-27", undefined, "Portugal Escape"),
    ).toBe("3 ימים בPortugal Escape");
  });
});
