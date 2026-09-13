import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readSource(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("places global search contracts", () => {
  it("does not keep a permanent Japan region restriction constant", () => {
    expect(readSource("features/places/constants.ts")).not.toContain("PLACES_INCLUDED_REGION_CODES");
    expect(readSource("features/places/googlePlaces.server.ts")).not.toContain("includedRegionCodes");
  });

  it("documents global accommodation and activity autocomplete", () => {
    const docs = readSource("../docs/places-foundation.md");
    expect(docs).toContain("Global search configuration");
    expect(docs).not.toContain('includedRegionCodes: ["jp"]');
  });

  it("does not hardcode Japan as a display fallback", () => {
    expect(readSource("features/places/googlePlaces.server.ts")).not.toMatch(/city:.*"Japan"/);
    expect(readSource("features/accommodations/resolve-accommodation-identity.ts")).not.toContain(
      'city: "Japan"',
    );
  });
});
