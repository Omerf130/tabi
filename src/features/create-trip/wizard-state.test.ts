import { describe, expect, it } from "vitest";
import {
  CREATE_TRIP_WIZARD_STEPS,
  createInitialWizardState,
  isValidWizardDateRange,
  suggestTripName,
} from "./wizard-state";

describe("create trip wizard state", () => {
  it("uses exactly three visible steps ending in Trip Details", () => {
    expect(CREATE_TRIP_WIZARD_STEPS).toEqual(["destination", "dates", "details"]);
    expect(createInitialWizardState().step).toBe("destination");
  });

  it("suggests a trip name from destination and start year", () => {
    expect(
      suggestTripName(
        {
          googlePlaceId: "place-jp",
          displayName: "Japan",
          latitude: 1,
          longitude: 2,
        },
        "2026-10-24",
      ),
    ).toBe("Japan 2026");
  });

  it("validates date ranges with existing max trip length rules", () => {
    expect(isValidWizardDateRange("2026-10-24", "2026-11-19")).toBe(true);
    expect(isValidWizardDateRange("2026-11-19", "2026-10-24")).toBe(false);
    expect(isValidWizardDateRange("2026-01-01", "2026-12-31")).toBe(false);
  });
});
