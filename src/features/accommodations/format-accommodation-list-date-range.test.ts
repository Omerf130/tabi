import { describe, expect, it } from "vitest";
import { formatAccommodationListDateRange } from "./format-accommodation-list-date-range";

describe("formatAccommodationListDateRange", () => {
  it("formats compact same-year ranges", () => {
    expect(formatAccommodationListDateRange("2026-10-24", "2026-10-27")).toBe(
      "24.10 – 27.10",
    );
  });

  it("includes year when check-in and check-out span different years", () => {
    expect(formatAccommodationListDateRange("2026-12-30", "2027-01-02")).toBe(
      "30.12.2026 – 02.01.2027",
    );
  });
});
