import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

const S3E_TRIP_SETTINGS_SCSS = [
  "features/settings/SettingsHub.module.scss",
  "features/settings/currency/CurrencySettings.module.scss",
  "features/settings/language/LanguageSettings.module.scss",
  "features/settings/maps/MapsSettings.module.scss",
  "features/trips/settings/trip-details/TripDetailsSettings.module.scss",
  "features/trips/settings/trip-details/TripDateChangeConfirmDialog.module.scss",
  "features/trips/settings/travelers/TravelersSettings.module.scss",
];

const S3E_PROFILE_SCSS = [
  "features/account/AccountShell.module.scss",
  "features/account/Profile.module.scss",
  "features/account/UserAvatar.module.scss",
];

describe("S3E Trip Settings + Profile token migration", () => {
  it("keeps active S3E SCSS free of legacy burgundy/cream structural hex", () => {
    for (const file of [...S3E_TRIP_SETTINGS_SCSS, ...S3E_PROFILE_SCSS]) {
      const source = read(file).toLowerCase();
      expect(source).not.toContain("#7a2e38");
      expect(source).not.toContain("#f3eee6");
      expect(source).not.toContain("#fbf7f1");
    }
  });

  it("maps Settings Hub and sub-settings aliases to semantic tokens", () => {
    const hub = read("features/settings/SettingsHub.module.scss");
    expect(hub).toContain("--settings-surface: var(--color-surface)");
    expect(hub).toContain("--settings-border: var(--color-border)");

    const currency = read("features/settings/currency/CurrencySettings.module.scss");
    expect(currency).toContain("--currency-surface: var(--color-surface)");
  });

  it("uses semantic sheet tokens on Trip Settings dialogs", () => {
    const details = read(
      "features/trips/settings/trip-details/TripDetailsSettings.module.scss",
    );
    expect(details).toContain("var(--color-surface-elevated)");
    expect(details).toContain("var(--color-scrim)");
    expect(details).toContain("var(--shadow-sheet)");

    const travelers = read(
      "features/trips/settings/travelers/TravelersSettings.module.scss",
    );
    expect(travelers).toContain("var(--color-scrim)");
    expect(travelers).toContain("var(--shadow-sheet)");
  });

  it("uses global semantic tokens on Profile without trip-theme hooks", () => {
    const profile = read("features/account/Profile.module.scss");
    expect(profile).toContain("--profile-border: var(--color-border)");
    expect(profile).not.toContain("data-trip-theme");
    expect(profile).not.toContain("themeKey");
    expect(profile).not.toMatch(/--profile-primary|--account-primary/);
  });

  it("does not introduce trip theme hooks in Trip Settings", () => {
    for (const file of S3E_TRIP_SETTINGS_SCSS) {
      const source = read(file);
      expect(source).not.toContain("data-trip-theme");
      expect(source).not.toContain("themeKey");
    }
  });

  it("TripManageHeader reuses TripHeader styles aligned in S3B", () => {
    const header = read("features/app-shell/TripManageHeader.tsx");
    expect(header).toContain("TripHeader.module.scss");
    const tripHeader = read("features/app-shell/TripHeader.module.scss");
    expect(tripHeader).toContain("var(--color-text)");
  });
});
