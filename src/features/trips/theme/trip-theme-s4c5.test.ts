import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const tokensPath = join(process.cwd(), "src/styles/tokens.scss");
const themesPath = join(process.cwd(), "src/features/trips/theme/trip-themes.scss");

const tokensSource = readFileSync(tokensPath, "utf8");
const themesSource = readFileSync(themesPath, "utf8");

const DEPTH_TOKENS = [
  "--color-surface-themed",
  "--color-surface-themed-strong",
  "--color-surface-card",
  "--color-accent-well",
  "--color-shell-surface",
] as const;

const STATUS_TOKENS = [
  "--color-danger:",
  "--color-success:",
  "--color-warning:",
] as const;

describe("S4C.5 Ocean visual depth", () => {
  it("defines canonical default depth tokens that preserve S3 hierarchy", () => {
    for (const token of DEPTH_TOKENS) {
      expect(tokensSource).toContain(`${token}:`);
    }
    expect(tokensSource).toMatch(
      /--color-surface-card:\s*#ffffff;/,
    );
    expect(tokensSource).toMatch(
      /--color-surface-themed:\s*#f3f6fa;/,
    );
  });

  it("overrides depth tokens for Ocean without status/domain tokens", () => {
    const oceanBlock = themesSource.slice(
      themesSource.indexOf('[data-trip-theme="ocean"]'),
    );
    for (const token of DEPTH_TOKENS) {
      expect(oceanBlock).toContain(`${token}:`);
    }
    for (const token of STATUS_TOKENS) {
      expect(oceanBlock).not.toContain(token);
    }
    expect(themesSource).not.toMatch(
      /\[data-trip-theme="ocean"\][^{]*\{[^}]*\.[a-z]/,
    );
  });

  it("wires Travel Hub and Settings to semantic depth tokens", () => {
    const hub = readFileSync(
      join(process.cwd(), "src/features/travel-hub/TravelHub.module.scss"),
      "utf8",
    );
    expect(hub).toContain("--hub-surface-cool: var(--color-surface-themed)");
    expect(hub).toContain("var(--color-surface-card)");
    expect(hub).toContain("var(--color-accent-well)");
    expect(hub).not.toContain("[data-trip-theme");

    const settingsHub = readFileSync(
      join(process.cwd(), "src/features/settings/SettingsHub.module.scss"),
      "utf8",
    );
    expect(settingsHub).toContain("var(--color-surface-card)");
    expect(settingsHub).toContain("var(--color-accent-well)");
  });

  it("does not add Sakura/Forest/Sunset palettes yet", () => {
    expect(themesSource).not.toContain('[data-trip-theme="sakura"]');
    expect(themesSource).not.toContain('[data-trip-theme="forest"]');
    expect(themesSource).not.toContain('[data-trip-theme="sunset"]');
  });
});
