import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveManageBackHref } from "@/features/app-shell/TripManageHeader";
import { getActiveNavSection } from "@/features/app-shell/navigation";
import {
  buildSettingsHubHref,
  buildSettingsLanguageHref,
} from "@/features/settings/constants";

const tripId = "507f1f77bcf86cd799439011";

describe("Language settings", () => {
  it("uses dedicated static /manage/language page", () => {
    const pagePath = join(
      process.cwd(),
      "src/app/app/trips/[tripId]/manage/language/page.tsx",
    );
    const source = readFileSync(pagePath, "utf8");
    expect(source).toContain("LanguageSettingsContent");
    expect(source).not.toContain("TripManagementShell");
  });

  it("routes Settings hub Language row to /manage/language", () => {
    expect(buildSettingsLanguageHref(tripId)).toBe(
      `/app/trips/${tripId}/manage/language`,
    );
  });

  it("routes header back to Settings hub and keeps Settings nav active", () => {
    const path = buildSettingsLanguageHref(tripId);
    expect(resolveManageBackHref(path, tripId)).toBe(buildSettingsHubHref(tripId));
    expect(getActiveNavSection(path, tripId)).toBe("settings");
  });

  it("shows language-only UI and reuses locale action", () => {
    const clientPath = join(
      process.cwd(),
      "src/features/settings/language/LanguageSettings.client.tsx",
    );
    const source = readFileSync(clientPath, "utf8");
    expect(source).toContain("InterfaceLanguagePreference");
    expect(source).not.toContain("updateUserLocaleAction");
    expect(source).toContain('variant="settingsList"');
    expect(source).toContain("languagePage.sectionTitle");
    expect(source).not.toContain("myTrips");
    expect(source).not.toContain("LogoutButton");
    expect(source).not.toContain("accountEmail");
  });

  it("hides account footer on language settings route", () => {
    const layoutPath = join(
      process.cwd(),
      "src/app/app/trips/[tripId]/manage/layout.tsx",
    );
    const gatePath = join(
      process.cwd(),
      "src/features/settings/ManageAccountFooterGate.client.tsx",
    );
    const layoutSource = readFileSync(layoutPath, "utf8");
    const gateSource = readFileSync(gatePath, "utf8");
    expect(layoutSource).toContain("ManageAccountFooterGate");
    expect(gateSource).toContain("/manage/language");
    expect(gateSource).not.toContain("TripManagementAccountFooter");
  });

  it("locale picker exposes Hebrew and English options", () => {
    const pickerPath = join(
      process.cwd(),
      "src/features/i18n/components/InterfaceLanguagePreference.tsx",
    );
    const source = readFileSync(pickerPath, "utf8");
    expect(source).toContain('(["he", "en"]');
    expect(source).toContain("languageHebrew");
    expect(source).toContain("languageEnglish");
    expect(source).toContain("updateUserLocaleAction");
    expect(source).toContain('aria-pressed={currentLocale === locale}');
  });
});
