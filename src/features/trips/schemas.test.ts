import { describe, expect, it } from "vitest";
import { createTripSchema } from "./schemas";

describe("createTripSchema", () => {
  it("accepts same-day trips", () => {
    const result = createTripSchema.safeParse({
      name: "טיול קצר",
      startDate: "2026-10-25",
      endDate: "2026-10-25",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBe("2026-10-25");
      expect(result.data.endDate).toBe("2026-10-25");
    }
  });

  it("rejects startDate after endDate", () => {
    const result = createTripSchema.safeParse({
      name: "טיול",
      startDate: "2026-11-18",
      endDate: "2026-10-25",
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra fields such as role", () => {
    const result = createTripSchema.safeParse({
      name: "טיול",
      startDate: "2026-10-25",
      endDate: "2026-11-18",
      role: "admin",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid calendar dates", () => {
    const result = createTripSchema.safeParse({
      name: "טיול",
      startDate: "2026-02-30",
      endDate: "2026-11-18",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a trip at the maximum duration", () => {
    const result = createTripSchema.safeParse({
      name: "טיול ארוך",
      startDate: "2026-01-01",
      endDate: "2026-06-29",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a trip longer than the maximum duration", () => {
    const result = createTripSchema.safeParse({
      name: "טיול ארוך מדי",
      startDate: "2026-01-01",
      endDate: "2026-07-01",
    });
    expect(result.success).toBe(false);
  });
});
