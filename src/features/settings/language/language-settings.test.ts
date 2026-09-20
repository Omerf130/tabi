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

  it("shows travel-language UI on trip settings page, not interface locale", () => {
    const clientPath = join(
      process.cwd(),
      "src/features/settings/language/TravelLanguageSettings.client.tsx",
    );
    const contentPath = join(
      process.cwd(),
      "src/features/settings/language/LanguageSettingsContent.tsx",
    );
    const clientSource = readFileSync(clientPath, "utf8");
    const contentSource = readFileSync(contentPath, "utf8");
    expect(clientSource).toContain("travelLanguagePage");
    expect(clientSource).not.toContain("InterfaceLanguagePreference");
    expect(contentSource).toContain("buildTravelLanguageSettingsViewModel");
    expect(contentSource).not.toContain("user.locale");
  });

  it("keeps interface locale on Profile only", () => {
    const profilePath = join(process.cwd(), "src/features/account/Profile.client.tsx");
    const profileSource = readFileSync(profilePath, "utf8");
    expect(profileSource).toContain("InterfaceLanguagePreference");
    expect(profileSource).toContain("languagePage.sectionHint");
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
