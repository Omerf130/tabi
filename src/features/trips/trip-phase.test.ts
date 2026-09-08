import { describe, expect, it } from "vitest";
import { getTripPhase } from "./trip-phase";

describe("getTripPhase", () => {
  it("marks upcoming trips using Japan calendar today", () => {
    expect(getTripPhase("2026-10-25", "2026-11-18", "2026-10-24")).toBe(
      "upcoming",
    );
  });

  it("marks active trips inclusively on start and end", () => {
    expect(getTripPhase("2026-10-25", "2026-11-18", "2026-10-25")).toBe(
      "active",
    );
    expect(getTripPhase("2026-10-25", "2026-11-18", "2026-11-18")).toBe(
      "active",
    );
  });

  it("marks completed trips after endDate", () => {
    expect(getTripPhase("2026-10-25", "2026-11-18", "2026-11-19")).toBe(
      "completed",
    );
  });
});
