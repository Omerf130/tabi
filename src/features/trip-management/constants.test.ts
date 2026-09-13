import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import {
  buildTripManagementHref,
  DEFAULT_TRIP_MANAGEMENT_SECTION,
  isOwnerOnlyManagementSection,
  LEGACY_SETTINGS_HASH_MAP,
  parseTripManagementSection,
  TRIP_MANAGEMENT_SECTION_IDS,
} from "./constants";
import {
  createTripManagementSections,
  getVisibleManagementSections,
} from "./trip-management-labels";

const tripId = "507f1f77bcf86cd799439011";
const t = createAppTranslator("TripManagement", "he");

describe("trip-management constants", () => {
  it("builds manage section hrefs", () => {
    expect(buildTripManagementHref(tripId, "details")).toBe(
      `/app/trips/${tripId}/manage/details`,
    );
    expect(buildTripManagementHref(tripId, "members")).toBe(
      `/app/trips/${tripId}/manage/members`,
    );
  });

  it("parses valid sections", () => {
    expect(parseTripManagementSection("details")).toBe("details");
    expect(parseTripManagementSection("transport")).toBe("transport");
    expect(parseTripManagementSection("unknown")).toBeNull();
  });

  it("defaults to details", () => {
    expect(DEFAULT_TRIP_MANAGEMENT_SECTION).toBe("details");
  });

  it("maps legacy settings hashes", () => {
    expect(LEGACY_SETTINGS_HASH_MAP.accommodations).toBe("accommodations");
    expect(LEGACY_SETTINGS_HASH_MAP.documents).toBe("documents");
    expect(LEGACY_SETTINGS_HASH_MAP.reminders).toBe("reminders");
  });

  it("hides owner-only sections from members", () => {
    const memberSections = getVisibleManagementSections(false, t).map((s) => s.id);
    expect(memberSections).toEqual(["details", "transport", "reminders", "members"]);
    expect(memberSections).not.toContain("accommodations");
    expect(memberSections).not.toContain("documents");
  });

  it("shows all sections to owners", () => {
    expect(getVisibleManagementSections(true, t)).toHaveLength(
      createTripManagementSections(t).length,
    );
    expect(getVisibleManagementSections(true, t)).toHaveLength(
      TRIP_MANAGEMENT_SECTION_IDS.length,
    );
  });

  it("identifies owner-only sections", () => {
    expect(isOwnerOnlyManagementSection("accommodations")).toBe(true);
    expect(isOwnerOnlyManagementSection("reminders")).toBe(false);
  });
});
