import { describe, expect, it } from "vitest";
import {
  getTripListSlugFromType,
  getTripListTypeFromSlug,
  isTripListSlug,
  isTripListType,
} from "./constants";

describe("trip list constants", () => {
  it("maps slugs to list types", () => {
    expect(getTripListTypeFromSlug("packing")).toBe("packing");
    expect(getTripListTypeFromSlug("before-trip")).toBe("before_trip");
    expect(getTripListTypeFromSlug("during-trip")).toBe("during_trip");
    expect(getTripListTypeFromSlug("pre-trip-shopping")).toBe("pre_trip_shopping");
  });

  it("maps list types back to slugs", () => {
    expect(getTripListSlugFromType("before_trip")).toBe("before-trip");
  });

  it("validates known slugs and list types", () => {
    expect(isTripListSlug("packing")).toBe(true);
    expect(isTripListSlug("unknown")).toBe(false);
    expect(isTripListType("during_trip")).toBe(true);
    expect(isTripListType("custom")).toBe(false);
  });
});
