import { describe, expect, it } from "vitest";
import { selectContextualAccommodation } from "./select-contextual-accommodation";

const accommodations = [
  { id: "a", checkInDate: "2026-10-25", checkOutDate: "2026-10-28" },
  { id: "b", checkInDate: "2026-10-29", checkOutDate: "2026-11-01" },
  { id: "c", checkInDate: "2026-11-01", checkOutDate: "2026-11-05" },
];

describe("selectContextualAccommodation", () => {
  it("returns null for completed trips", () => {
    expect(
      selectContextualAccommodation(accommodations, "completed", "2026-11-20"),
    ).toBeNull();
  });

  it("returns occupied accommodation during active trip", () => {
    const result = selectContextualAccommodation(
      accommodations,
      "active",
      "2026-10-26",
    );

    expect(result).toEqual({
      accommodation: accommodations[0],
      variant: "current",
    });
  });

  it("returns next upcoming accommodation between stays during active trip", () => {
    const result = selectContextualAccommodation(
      accommodations,
      "active",
      "2026-10-28",
    );

    expect(result).toEqual({
      accommodation: accommodations[1],
      variant: "upcoming",
    });
  });

  it("returns next upcoming accommodation before trip", () => {
    const result = selectContextualAccommodation(
      accommodations,
      "upcoming",
      "2026-10-01",
    );

    expect(result).toEqual({
      accommodation: accommodations[0],
      variant: "upcoming",
    });
  });

  it("returns first accommodation when all are in the past but trip is upcoming", () => {
    const result = selectContextualAccommodation(
      [{ id: "z", checkInDate: "2026-09-01", checkOutDate: "2026-09-05" }],
      "upcoming",
      "2026-10-01",
    );

    expect(result).toEqual({
      accommodation: { id: "z", checkInDate: "2026-09-01", checkOutDate: "2026-09-05" },
      variant: "upcoming",
    });
  });

  it("selects the next stay after the current one is removed", () => {
    const remaining = accommodations.filter((accommodation) => accommodation.id !== "a");
    const result = selectContextualAccommodation(remaining, "active", "2026-10-30");

    expect(result).toEqual({
      accommodation: accommodations[1],
      variant: "current",
    });
  });
});
