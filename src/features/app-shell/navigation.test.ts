import { describe, expect, it } from "vitest";
import {
  buildTripNavHref,
  getActiveNavSection,
  isSecondaryTripRoute,
  MOBILE_BOTTOM_NAV_SLOTS,
  NAV_SECTIONS,
} from "./navigation";

const TRIP_A = "507f1f77bcf86cd799439011";
const TRIP_B = "507f1f77bcf86cd799439012";

describe("navigation", () => {
  it("defines four primary rail sections without documents", () => {
    expect(NAV_SECTIONS).toEqual(["home", "itinerary", "more", "settings"]);
    expect(NAV_SECTIONS).not.toContain("documents");
    expect(MOBILE_BOTTOM_NAV_SLOTS).toEqual([
      "home",
      "itinerary",
      "quick-add",
      "more",
      "settings",
    ]);
  });

  it("builds trip nav hrefs", () => {
    expect(buildTripNavHref(TRIP_A, "home")).toBe(`/app/trips/${TRIP_A}`);
    expect(buildTripNavHref(TRIP_A, "itinerary")).toBe(
      `/app/trips/${TRIP_A}/itinerary`,
    );
    expect(buildTripNavHref(TRIP_A, "settings")).toBe(
      `/app/trips/${TRIP_A}/manage`,
    );
    expect(buildTripNavHref(TRIP_A, "more")).toBe(`/app/trips/${TRIP_A}/more`);
  });

  it("maps primary routes to active sections", () => {
    expect(getActiveNavSection(`/app/trips/${TRIP_A}`, TRIP_A)).toBe("home");
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/itinerary`, TRIP_A)).toBe(
      "itinerary",
    );
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/documents`, TRIP_A)).toBe(
      "more",
    );
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/more`, TRIP_A)).toBe(
      "more",
    );
  });

  it("maps management routes to settings", () => {
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/manage`, TRIP_A)).toBe(
      "settings",
    );
    expect(
      getActiveNavSection(`/app/trips/${TRIP_A}/manage/details`, TRIP_A),
    ).toBe("settings");
    expect(
      getActiveNavSection(`/app/trips/${TRIP_A}/manage/members`, TRIP_A),
    ).toBe("settings");
    expect(
      getActiveNavSection(`/app/trips/${TRIP_A}/manage/currency`, TRIP_A),
    ).toBe("settings");
    expect(
      getActiveNavSection(`/app/trips/${TRIP_A}/manage/accommodations`, TRIP_A),
    ).toBe("settings");
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/members`, TRIP_A)).toBe(
      "settings",
    );
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/settings`, TRIP_A)).toBe(
      "settings",
    );
  });

  it("maps travel hub secondary routes to more", () => {
    expect(
      getActiveNavSection(`/app/trips/${TRIP_A}/accommodations`, TRIP_A),
    ).toBe("more");
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/lists`, TRIP_A)).toBe(
      "more",
    );
    expect(
      getActiveNavSection(`/app/trips/${TRIP_A}/lists/packing`, TRIP_A),
    ).toBe("more");
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/currency`, TRIP_A)).toBe(
      "more",
    );
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/weather`, TRIP_A)).toBe(
      "more",
    );
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/transport`, TRIP_A)).toBe(
      "more",
    );
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/language`, TRIP_A)).toBe(
      "more",
    );
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/emergency`, TRIP_A)).toBe(
      "more",
    );
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/finance`, TRIP_A)).toBe(
      "more",
    );
    expect(
      getActiveNavSection(
        `/app/trips/${TRIP_A}/language/basics.hello`,
        TRIP_A,
      ),
    ).toBe("more");
  });

  it("does not map traveler routes to settings", () => {
    expect(
      getActiveNavSection(`/app/trips/${TRIP_A}/accommodations`, TRIP_A),
    ).not.toBe("settings");
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/transport`, TRIP_A)).not.toBe(
      "settings",
    );
    expect(getActiveNavSection(`/app/trips/${TRIP_A}/finance`, TRIP_A)).not.toBe(
      "settings",
    );
  });

  it("returns null for non-matching trip paths", () => {
    expect(getActiveNavSection(`/app/trips/${TRIP_B}`, TRIP_A)).toBeNull();
    expect(getActiveNavSection("/app/trips", TRIP_A)).toBeNull();
  });

  it("returns null for unknown trip subroutes", () => {
    expect(
      getActiveNavSection(`/app/trips/${TRIP_A}/unknown`, TRIP_A),
    ).toBeNull();
  });

  it("detects secondary trip routes", () => {
    expect(isSecondaryTripRoute(`/app/trips/${TRIP_A}/more`, TRIP_A)).toBe(
      true,
    );
    expect(isSecondaryTripRoute(`/app/trips/${TRIP_A}`, TRIP_A)).toBe(false);
  });
});
