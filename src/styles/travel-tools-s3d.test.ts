import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

const S3D_SCSS = [
  "features/travel-hub/TravelHub.module.scss",
  "features/travel-hub/ManagementHub.module.scss",
  "features/accommodations/AccommodationsPage.module.scss",
  "features/accommodations/AccommodationAddButton.module.scss",
  "features/accommodations/AccommodationDetail.module.scss",
  "features/accommodations/TaxiModeOverlay.module.scss",
  "features/transport/TransportPage.module.scss",
  "features/transport/TransportForm.module.scss",
  "features/transport/TransportAddMenu.module.scss",
  "features/transport/TransportDetail.module.scss",
  "features/documents/DocumentsPage.module.scss",
  "features/documents/DocumentDetail.module.scss",
  "features/lists/ListsLanding.module.scss",
  "features/lists/ListDetail.module.scss",
  "features/lists/ListProgressBar.module.scss",
  "features/finance/FinancePage.module.scss",
  "features/finance/EntityCostFields.module.scss",
  "features/currency/CurrencyConverter.module.scss",
  "features/weather/WeatherView.module.scss",
  "features/language/LanguagePage.module.scss",
  "features/language/PhraseDetail.module.scss",
  "features/emergency/EmergencyPage.module.scss",
];

const SEMANTIC_TOKENS = [
  "--color-background",
  "--color-surface",
  "--color-surface-elevated",
  "--color-text",
  "--color-text-muted",
  "--color-border",
  "--color-link",
  "--color-scrim",
  "--shadow-sm",
  "--shadow-sheet",
];

describe("S3D Travel Tools token migration", () => {
  it("keeps S3D SCSS free of legacy burgundy/cream structural hex", () => {
    for (const file of S3D_SCSS) {
      const source = read(file).toLowerCase();
      expect(source).not.toContain("#7a2e38");
      expect(source).not.toContain("#f3eee6");
      expect(source).not.toContain("#fbf7f1");
    }
  });

  it("maps Travel Hub generic aliases to semantic tokens", () => {
    const hub = read("features/travel-hub/TravelHub.module.scss");
    expect(hub).toContain("--hub-ink: var(--color-text)");
    expect(hub).toContain("--hub-surface-cool: var(--color-surface-themed)");
    expect(hub).toContain("--hub-blue: var(--color-link)");
  });

  it("retains Weather domain purple without global promotion", () => {
    const weather = read("features/weather/WeatherView.module.scss");
    expect(weather).toMatch(/#5b4fd6/);
    expect(weather).not.toMatch(
      /--color-primary:\s*#5b4fd6|--itinerary-primary:\s*var\(--color-primary\)/,
    );
  });

  it("retains Finance domain progress/over-budget semantics", () => {
    const finance = read("features/finance/FinancePage.module.scss");
    expect(finance).toContain("#dc2626");
    expect(finance).toContain("--finance-green: #16a34a");
    expect(finance).toContain("var(--color-surface-elevated)");
    expect(finance).toContain("var(--color-scrim)");
  });

  it("uses semantic sheet tokens on Finance dialogs", () => {
    const finance = read("features/finance/FinancePage.module.scss");
    expect(finance).toContain("var(--shadow-sheet)");
  });

  it("does not introduce trip theme hooks in Travel Tools", () => {
    for (const file of S3D_SCSS) {
      const source = read(file);
      expect(source).not.toContain("data-trip-theme");
      expect(source).not.toContain("themeKey");
    }
  });

  it("uses semantic tokens in tokenized Travel Tool stylesheets", () => {
    const domainOnlyFixed = new Set([
      "features/accommodations/TaxiModeOverlay.module.scss",
    ]);
    for (const file of S3D_SCSS) {
      if (domainOnlyFixed.has(file)) {
        continue;
      }
      const source = read(file);
      const usesSemantic = SEMANTIC_TOKENS.some((token) =>
        source.includes(token),
      );
      expect(usesSemantic, file).toBe(true);
    }
  });
});
