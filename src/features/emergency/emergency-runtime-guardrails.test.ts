import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const EMERGENCY_ROOT = join(process.cwd(), "src/features/emergency");

const FORBIDDEN = [
  "getDefaultEmergencyPack",
  "JP_EMERGENCY_PACK",
  "getPhraseFromDefaultPack",
  "./builtin/jp",
  "./builtin/registry",
] as const;

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "builtin") {
        continue;
      }
      files.push(...collectSourceFiles(full));
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".test.ts")) {
      files.push(full);
    }
  }
  return files;
}

describe("emergency runtime guardrails", () => {
  it("does not reference legacy JP pack or default phrase pack in runtime sources", () => {
    const offenders: string[] = [];
    for (const file of collectSourceFiles(EMERGENCY_ROOT)) {
      const content = readFileSync(file, "utf8");
      for (const token of FORBIDDEN) {
        if (content.includes(token)) {
          offenders.push(`${file}: ${token}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("has no built-in emergency pack registry", () => {
    expect(() => statSync(join(EMERGENCY_ROOT, "builtin/registry.ts"))).toThrow();
  });
});
