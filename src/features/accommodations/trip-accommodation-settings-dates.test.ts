import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const settingsSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "TripAccommodationSettings.tsx"),
  "utf8",
);

describe("TripAccommodationSettings date inputs", () => {
  it("allows checkout selection through the day after trip end", () => {
    expect(settingsSource).toContain("getMaxAccommodationCheckOutDate(endDate)");
    expect(settingsSource).toMatch(/name="checkOutDate"[\s\S]*?max=\{maxCheckOutDate\}/);
  });
});
