import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readThemes(): string {
  return readFileSync(join(process.cwd(), "src/features/trips/theme/trip-themes.scss"), "utf8");
}

function themeBlock(source: string, key: string): string {
  const start = source.indexOf(`[data-trip-theme="${key}"]`);
  expect(start).toBeGreaterThanOrEqual(0);
  const nextKeys = ["default", "ocean", "sakura", "forest", "sunset"].filter((k) => k !== key);
  let end = source.length;
  for (const other of nextKeys) {
    const idx = source.indexOf(`[data-trip-theme="${other}"]`, start + 1);
    if (idx > start && idx < end) {
      end = idx;
    }
  }
  return source.slice(start, end).trim();
}

function tokenLines(block: string): string[] {
  return block
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("--"));
}

/** Approved Ocean semantic tokens — must not change during intensity polish. */
const OCEAN_APPROVED_TOKENS = [
  "--theme-atmosphere-primary: rgb(21 94 117 / 14%);",
  "--theme-atmosphere-secondary: rgb(21 94 117 / 8%);",
  "--theme-atmosphere-soft: rgb(21 94 117 / 6%);",
  "--color-primary: #155e75;",
  "--color-primary-hover: #1a708c;",
  "--color-primary-pressed: #0f4a5e;",
  "--color-background: #edf4f8;",
  "--color-surface: #ffffff;",
  "--color-surface-card: #f8fcfe;",
  "--color-surface-home-page: #f8fcfe;",
  "--color-shell-surface: #f2f8fb;",
  "--color-text: #0f2d3d;",
  "--color-text-muted: #5a7184;",
  "--color-link: #0369a1;",
] as const;

describe("trip theme background intensity polish", () => {
  const themes = readThemes();

  it("freezes Ocean theme tokens (approved reference)", () => {
    const lines = tokenLines(themeBlock(themes, "ocean"));
    for (const token of OCEAN_APPROVED_TOKENS) {
      expect(lines).toContain(token);
    }
  });

  it("keeps Default as neutral baseline", () => {
    const block = themeBlock(themes, "default");
    expect(block).toContain("--color-surface-home-page: #ffffff");
    expect(block).not.toContain("--color-background:");
    expect(block).not.toContain("--color-primary:");
  });

  it("strengthens Sakura page background while cards stay lighter", () => {
    const block = themeBlock(themes, "sakura");
    expect(block).toContain("--color-background: #f0e4e9");
    expect(block).toContain("--color-surface-card: #fffbfc");
    expect(block).toContain("--color-surface: #ffffff");
  });

  it("strengthens Forest page background while cards stay lighter", () => {
    const block = themeBlock(themes, "forest");
    expect(block).toContain("--color-background: #e3efe8");
    expect(block).toContain("--color-surface-card: #fbfdfc");
  });

  it("strengthens Sunset page background while cards stay lighter", () => {
    const block = themeBlock(themes, "sunset");
    expect(block).toContain("--color-background: #f2e8dc");
    expect(block).toContain("--color-surface-card: #fffdfa");
  });

  it("does not touch Ocean atmosphere layer opacities in SCSS module", () => {
    const atmosphere = readFileSync(
      join(process.cwd(), "src/features/trips/theme/TripThemeAtmosphere.module.scss"),
      "utf8",
    );
    expect(atmosphere).toMatch(
      /\.root\[data-atmosphere-theme="ocean"\] \.layer\[data-layer="top"\][\s\S]*?opacity: 0\.52;/,
    );
    expect(atmosphere).toMatch(
      /:global\(\.themeScope:has\(\[data-trip-workspace="home"\]\)\)[\s\S]*?ocean[\s\S]*?opacity: 0\.46;/,
    );
  });
});
