import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("navigation preference causes no extra Places API", () => {
  it("navigation-url and entity helpers do not import Places or fetch", () => {
    for (const relativePath of [
      "src/lib/maps/navigation-url.ts",
      "src/lib/maps/navigation-entities.ts",
    ]) {
      const source = readFileSync(join(process.cwd(), relativePath), "utf8");
      expect(source).not.toContain("googlePlaces");
      expect(source).not.toContain("fetchPlaceDetails");
      expect(source).not.toMatch(/\bfetch\s*\(/);
    }
  });
});
