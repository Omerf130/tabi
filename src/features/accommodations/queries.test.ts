import { describe, expect, it, vi } from "vitest";
import { compareAccommodations } from "./accommodation-domain";

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/Accommodation", () => ({
  Accommodation: {
    find: vi.fn(),
    findOne: vi.fn(),
  },
}));

describe("accommodation query ordering", () => {
  it("orders by checkInDate ASC then id ASC", () => {
    const items = [
      { id: "507f1f77bcf86cd799439014", checkInDate: "2026-11-01" },
      { id: "507f1f77bcf86cd799439011", checkInDate: "2026-10-25" },
      { id: "507f1f77bcf86cd799439012", checkInDate: "2026-10-25" },
      { id: "507f1f77bcf86cd799439013", checkInDate: "2026-10-28" },
    ];

    const sorted = [...items].sort(compareAccommodations);
    expect(sorted.map((item) => item.id)).toEqual([
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439013",
      "507f1f77bcf86cd799439014",
    ]);
  });
});
