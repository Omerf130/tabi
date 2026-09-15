import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import heMessages from "../../../../../messages/he.json";
import enMessages from "../../../../../messages/en.json";
import { buildTripManagementHref } from "@/features/trip-management/constants";

const tripId = "507f1f77bcf86cd799439011";

const clientPath = join(
  process.cwd(),
  "src/features/trips/settings/trip-details/TripDetailsSettings.client.tsx",
);

describe("Trip Details presentation", () => {
  const source = readFileSync(clientPath, "utf8");

  it("uses compact settings rows and edit sheets instead of inline section cards", () => {
    expect(source).toContain("TripDetailsSettingsRow");
    expect(source).toContain("TripDetailsEditSheet");
    expect(source).not.toContain("sections.identity");
    expect(source).not.toContain("TripCoverSettings");
  });

  it("opens date editing with settings calendar variant", () => {
    expect(source).toContain('variant="settings"');
    expect(source).toContain("TripDateRangeCalendar");
    expect(source).toContain("TripDateChangeConfirmDialog");
  });

  it("links travelers to the canonical members management route", () => {
    expect(source).toContain("travelersHref");
    const contentPath = join(
      process.cwd(),
      "src/features/trips/settings/trip-details/TripDetailsSettingsContent.tsx",
    );
    const contentSource = readFileSync(contentPath, "utf8");
    expect(contentSource).toContain('buildTripManagementHref(tripId, "members")');
    expect(buildTripManagementHref(tripId, "members")).toBe(
      `/app/trips/${tripId}/manage/members`,
    );
  });

  it("exposes redesigned i18n keys in HE and EN", () => {
    expect(enMessages.TripDetailsSettings.sections.tripInformation).toBe(
      "Trip information",
    );
    expect(heMessages.TripDetailsSettings.sections.tripInformation).toBe(
      "פרטי הטיול",
    );
    expect(enMessages.TripDetailsSettings.dateChange.zones.destructive).toBe(
      "Permanent changes",
    );
    expect(enMessages.TripDetailsSettings.cover.change).toBe("Change cover");
  });
});
