import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src");

describe("S4D.2 theme atmosphere composition polish", () => {
  it("flushes Trip Home hero to workspace top on mobile via AppPage", () => {
    const homePage = readFileSync(
      join(root, "app/app/trips/[tripId]/page.tsx"),
      "utf8",
    );
    const appPageStyles = readFileSync(
      join(root, "features/app-shell/AppPage.module.scss"),
      "utf8",
    );
    expect(homePage).toContain("flushTop");
    expect(appPageStyles).toContain('[data-flush-top="true"]');
    expect(appPageStyles).toMatch(/padding-top:\s*0/);
  });

  it("marks Trip Home workspace for hero-aware atmosphere positioning", () => {
    const homeContent = readFileSync(
      join(root, "features/trip-home/TripHomeContent.tsx"),
      "utf8",
    );
    const atmosphereStyles = readFileSync(
      join(root, "features/trips/theme/TripThemeAtmosphere.module.scss"),
      "utf8",
    );
    expect(homeContent).toContain('data-trip-workspace="home"');
    expect(atmosphereStyles).toContain('[data-trip-workspace="home"]');
  });

  it("does not use full-scene ocean bottom-wave or sunset horizon in active layers", () => {
    const assets = readFileSync(
      join(root, "features/trips/theme/trip-theme-atmosphere-assets.ts"),
      "utf8",
    );
    expect(assets).not.toContain("bottom-wave.png");
    expect(assets).not.toContain("sunset2.png");
  });
});
