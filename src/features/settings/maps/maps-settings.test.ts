import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveManageBackHref } from "@/features/app-shell/TripManageHeader";
import { getActiveNavSection } from "@/features/app-shell/navigation";
import {
  buildSettingsHubHref,
  buildSettingsMapsHref,
} from "@/features/settings/constants";
import { buildSettingsHubViewModel } from "@/features/settings/build-settings-hub-view-model";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { resolvePreferredMapsApp } from "@/lib/maps/maps-app";

const tripId = "507f1f77bcf86cd799439011";

describe("Maps settings", () => {
  it("uses dedicated static /manage/maps page", () => {
    const pagePath = join(
      process.cwd(),
      "src/app/app/trips/[tripId]/manage/maps/page.tsx",
    );
    const source = readFileSync(pagePath, "utf8");
    expect(source).toContain("MapsSettingsContent");
    expect(source).not.toContain("TripManagementShell");
  });

  it("routes Settings hub Maps row to /manage/maps", () => {
    expect(buildSettingsMapsHref(tripId)).toBe(
      `/app/trips/${tripId}/manage/maps`,
    );
  });

  it("routes header back to Settings hub and keeps Settings nav active", () => {
    const path = buildSettingsMapsHref(tripId);
    expect(resolveManageBackHref(path, tripId)).toBe(buildSettingsHubHref(tripId));
    expect(getActiveNavSection(path, tripId)).toBe("settings");
  });

  it("marks maps hub row active (not coming soon)", () => {
    const t = createAppTranslator("Settings", "en");
    const model = buildSettingsHubViewModel({
      trip: {
        id: tripId,
        name: "Trip",
        startDate: "2026-01-01",
        endDate: "2026-01-07",
        role: "owner",
        themeKey: "default",
      },
      isOwner: true,
      baseCurrency: "ILS",
      locale: "en",
      t,
    });
    const mapsRow = model.sections
      .flatMap((section) => section.rows)
      .find((row) => row.id === "maps");
    expect(mapsRow?.comingSoon).toBe(false);
    expect(mapsRow?.href).toBe(buildSettingsMapsHref(tripId));
  });

  it("shows Google as effective selection when persisted null", () => {
    expect(resolvePreferredMapsApp(null)).toBe("google");
    const clientPath = join(
      process.cwd(),
      "src/features/maps/components/PreferredMapsAppPreference.tsx",
    );
    const source = readFileSync(clientPath, "utf8");
    expect(source).toContain("resolvePreferredMapsApp(storedPreferredMapsApp)");
    expect(source).toContain('data-active={effectiveProvider === provider');
    expect(source).not.toContain("Save");
  });

  it("persists selection via immediate form action", () => {
    const clientPath = join(
      process.cwd(),
      "src/features/maps/components/PreferredMapsAppPreference.tsx",
    );
    const source = readFileSync(clientPath, "utf8");
    expect(source).toContain("updateUserPreferredMapsAppAction");
    expect(source).toContain('name="preferredMapsApp"');
  });
});
