import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src");
const tokensPath = join(process.cwd(), "src/styles/tokens.scss");
const tokensSource = readFileSync(tokensPath, "utf8");

const OLD_BRAND_HEX = ["#7a2e38", "#f3eee6", "#fbf7f1", "#ddd4c8"] as const;

const LEGACY_DEFERRED_SCSS = [
  "features/accommodations/TripAccommodationSettings.module.scss",
  "features/documents/TripDocumentSettings.module.scss",
] as const;

function collectScssFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") {
        continue;
      }
      collectScssFiles(full, acc);
    } else if (entry.name.endsWith(".module.scss") || entry.name.endsWith(".scss")) {
      acc.push(full);
    }
  }
  return acc;
}

function extractGlobalTokenDefs(source: string): Set<string> {
  const defs = new Set<string>();
  for (const match of source.matchAll(/(--(?:color|shadow)-[a-z0-9-]+)\s*:/g)) {
    defs.add(match[1]);
  }
  return defs;
}

function extractVarReferences(source: string): string[] {
  return [...source.matchAll(/var\(\s*(--(?:color|shadow)-[a-z0-9-]+)/g)].map((m) => m[1]);
}

function relativeFromSrc(fullPath: string): string {
  return fullPath.replace(/\\/g, "/").replace(/^.*\/src\//, "");
}

describe("S3 final repository integrity", () => {
  it("does not enable OS dark mode auto-switch in production src", () => {
    const files: string[] = [];
    function walk(dir: string) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "node_modules") {
            continue;
          }
          walk(full);
        } else if (/\.(scss|tsx|ts)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) {
          files.push(full);
        }
      }
    }
    walk(root);

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("prefers-color-scheme");
    }
  });

  it("has no active generic SCSS dependency on Phase-1 burgundy/cream (excluding domain art)", () => {
    const scssFiles = collectScssFiles(root);
    const offenders: string[] = [];

    for (const file of scssFiles) {
      const lower = readFileSync(file, "utf8").toLowerCase();
      for (const hex of OLD_BRAND_HEX) {
        if (lower.includes(hex)) {
          offenders.push(relativeFromSrc(file));
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("production styles do not reference undefined global color/shadow tokens", () => {
    const globalTokens = extractGlobalTokenDefs(tokensSource);
    const scssFiles = collectScssFiles(root).filter(
      (f) => !f.replace(/\\/g, "/").endsWith("styles/tokens.scss"),
    );

    const broken = new Set<string>();

    for (const file of scssFiles) {
      const source = readFileSync(file, "utf8");
      const localDefs = new Set(
        [...source.matchAll(/(--(?:color|shadow)-[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
      );

      for (const ref of extractVarReferences(source)) {
        if (globalTokens.has(ref) || localDefs.has(ref)) {
          continue;
        }
        broken.add(`${relativeFromSrc(file)} → ${ref}`);
      }
    }

    expect([...broken].sort()).toEqual([]);
  });

  it("classifies known legacy manage styling as deferred (still on disk, not S3F scope)", () => {
    for (const legacy of LEGACY_DEFERRED_SCSS) {
      expect(() => readFileSync(join(root, legacy), "utf8")).not.toThrow();
    }
  });

  it("TripShellLayout is only wired from the trip id layout route", () => {
    const tripLayout = readFileSync(
      join(root, "app/app/trips/[tripId]/layout.tsx"),
      "utf8",
    );
    expect(tripLayout).toContain("TripShellLayout");

    const appLayout = readFileSync(join(root, "app/app/layout.tsx"), "utf8");
    expect(appLayout).not.toContain("TripShellLayout");
  });

  it("does not implement S4B visual theme hooks (data-trip-theme) in production src", () => {
    const files: string[] = [];
    function walk(dir: string) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "node_modules") {
            continue;
          }
          walk(full);
        } else if (/\.(tsx|ts|scss)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) {
          files.push(full);
        }
      }
    }
    walk(root);

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("data-trip-theme");
      expect(source).not.toContain("[data-trip-theme");
    }
  });
});
