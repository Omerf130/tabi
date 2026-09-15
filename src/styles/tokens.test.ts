import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src");
const tokensPath = join(process.cwd(), "src/styles/tokens.scss");
const tokensSource = readFileSync(tokensPath, "utf8");

const REQUIRED_LIGHT_TOKENS = [
  "--color-background",
  "--color-surface",
  "--color-surface-elevated",
  "--color-surface-subtle",
  "--color-surface-themed",
  "--color-surface-themed-strong",
  "--color-surface-card",
  "--color-accent-well",
  "--color-shell-surface",
  "--color-primary",
  "--color-primary-hover",
  "--color-primary-pressed",
  "--color-primary-soft",
  "--color-on-primary",
  "--color-accent",
  "--color-accent-soft",
  "--color-text",
  "--color-text-muted",
  "--color-border",
  "--color-border-subtle",
  "--color-border-strong",
  "--color-link",
  "--color-focus",
  "--color-scrim",
  "--color-success",
  "--color-warning",
  "--color-danger",
  "--shadow-sm",
  "--shadow-md",
  "--shadow-lg",
  "--shadow-sheet",
] as const;

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") {
        continue;
      }
      collectSourceFiles(full, acc);
    } else if (/\.(scss|tsx|ts|css)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function extractGlobalVarReferences(source: string): string[] {
  const matches = source.matchAll(/var\(\s*(--[a-z0-9-]+)/g);
  return [...matches].map((m) => m[1]);
}

describe("design tokens (S3A foundation)", () => {
  it("defines required semantic tokens in tokens.scss (light block)", () => {
    for (const token of REQUIRED_LIGHT_TOKENS) {
      expect(tokensSource).toContain(`${token}:`);
    }
  });

  it("locks canonical light brand values", () => {
    expect(tokensSource).toMatch(/--color-primary:\s*#1a2740;/);
    expect(tokensSource).toMatch(/--color-background:\s*#f4f5f8;/);
    expect(tokensSource).toMatch(/--color-surface:\s*#ffffff;/);
    expect(tokensSource).toMatch(/--color-link:\s*#1d4ed8;/);
    expect(tokensSource).toMatch(/--color-danger:\s*#b42318;/);
    expect(tokensSource).toMatch(/--color-success:\s*#067647;/);
  });

  it("defines dark counterparts for new semantic tokens", () => {
    const darkBlock = tokensSource.slice(tokensSource.indexOf('[data-color-scheme="dark"]'));
    for (const token of [
      "--color-surface-elevated",
      "--color-border-subtle",
      "--color-border-strong",
      "--color-link",
      "--color-scrim",
      "--shadow-lg",
      "--shadow-sheet",
      "--color-primary-soft",
    ]) {
      expect(darkBlock).toContain(`${token}:`);
    }
  });

  it("does not introduce trip theme implementation hooks", () => {
    expect(tokensSource).not.toContain("data-trip-theme");
    expect(tokensSource).not.toContain("themeKey");
  });

  it("has no production references to undefined global shadow tokens", () => {
    const files = collectSourceFiles(root);
    const undefinedShadowRefs: string[] = [];

    for (const file of files) {
      if (file.replace(/\\/g, "/").endsWith("styles/tokens.test.ts")) {
        continue;
      }
      const source = readFileSync(file, "utf8");
      for (const ref of extractGlobalVarReferences(source)) {
        if (ref === "--shadow-overlay") {
          undefinedShadowRefs.push(file);
        }
      }
    }

    expect(undefinedShadowRefs).toEqual([]);
  });

  it("defines tokens referenced by border-subtle and shadow-lg consumers", () => {
    expect(tokensSource).toContain("--color-border-subtle:");
    expect(tokensSource).toContain("--shadow-lg:");
    expect(tokensSource).toContain("--shadow-sheet:");
  });
});
