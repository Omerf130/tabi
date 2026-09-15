import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import heMessages from "../../../../../messages/he.json";
import enMessages from "../../../../../messages/en.json";
import { resolveManageBackHref } from "@/features/app-shell/TripManageHeader";
import { getActiveNavSection } from "@/features/app-shell/navigation";
import { buildTravelersSettingsHref } from "@/features/settings/constants";
import { buildTripManagementHref } from "@/features/trip-management/constants";

const tripId = "507f1f77bcf86cd799439011";

describe("Travelers settings", () => {
  it("exposes TravelersSettings messages in EN and HE", () => {
    expect(enMessages.TravelersSettings.pageTitle).toBe("Travelers & Collaboration");
    expect(heMessages.TravelersSettings.pageTitle).toBe("מטיילים ושיתוף");
  });

  it("uses dedicated static /manage/members page", () => {
    const pagePath = join(
      process.cwd(),
      "src/app/app/trips/[tripId]/manage/members/page.tsx",
    );
    const source = readFileSync(pagePath, "utf8");
    expect(source).toContain("TravelersSettingsContent");
    expect(source).not.toContain("TripManagementShell");
  });

  it("does not render members through legacy section switch", () => {
    const sectionPagePath = join(
      process.cwd(),
      "src/app/app/trips/[tripId]/manage/[section]/page.tsx",
    );
    const source = readFileSync(sectionPagePath, "utf8");
    expect(source).not.toContain('case "members"');
    expect(source).not.toContain("TripMembersManagementClient");
  });

  it("routes header back to Settings hub from travelers screen", () => {
    const path = buildTravelersSettingsHref(tripId);
    expect(resolveManageBackHref(path, tripId)).toBe(`/app/trips/${tripId}/manage`);
    expect(buildTravelersSettingsHref(tripId)).toBe(
      buildTripManagementHref(tripId, "members"),
    );
  });

  it("keeps Settings nav active on travelers screen", () => {
    const path = buildTravelersSettingsHref(tripId);
    expect(getActiveNavSection(path, tripId)).toBe("settings");
  });

  it("uses grouped traveler presentation and settings-style actions", () => {
    const clientPath = join(
      process.cwd(),
      "src/features/trips/settings/travelers/TravelersSettings.client.tsx",
    );
    const source = readFileSync(clientPath, "utf8");
    expect(source).toContain("UserAvatar");
    expect(source).toContain("avatarHref");
    expect(source).toContain("inviteActionRow");
    expect(source).toContain("TravelersSettingsSheet");
    expect(source).not.toContain("TripDetailsEditSheet");
    expect(source).not.toContain('t("joined"');
    expect(source).toContain("tripAccessSection");
    expect(source).toContain("destructiveRow");
  });

  it("uses bottom sheet overlay semantics for management", () => {
    const sheetPath = join(
      process.cwd(),
      "src/features/trips/settings/travelers/TravelersSettingsSheet.client.tsx",
    );
    const source = readFileSync(sheetPath, "utf8");
    expect(source).toContain("<dialog");
    expect(source).toContain("showModal");
    expect(source).not.toContain("sheetClose");
  });

  it("exposes presentation i18n keys in EN and HE", () => {
    expect(enMessages.TravelersSettings.travelersSectionCount).toBeTruthy();
    expect(enMessages.TravelersSettings.tripAccessSection).toBeTruthy();
    expect(heMessages.TravelersSettings.travelersSectionCount).toBeTruthy();
    expect(heMessages.TravelersSettings.tripAccessSection).toBeTruthy();
  });
});
