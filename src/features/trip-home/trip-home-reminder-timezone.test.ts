import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Trip Home reminder timezone", () => {
  it("includes the canonical browser timezone field in home reminder forms", () => {
    const formFields = readFileSync(
      join(process.cwd(), "src/features/trip-home/TripHomeReminderForm.client.tsx"),
      "utf8",
    );

    expect(formFields).toContain("TripReminderBrowserTimeZoneField");
    expect(formFields).not.toContain("Asia/Tokyo");
    expect(formFields).not.toContain("destination");
  });
});
