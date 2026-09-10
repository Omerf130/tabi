import { describe, expect, it } from "vitest";
import { shouldExpandActivityDetails } from "./should-expand-activity-details";

describe("shouldExpandActivityDetails", () => {
  it("keeps optional details collapsed on create by default", () => {
    expect(
      shouldExpandActivityDetails({ notes: "", type: "attraction" }, "create"),
    ).toBe(false);
  });

  it("expands when notes exist on edit", () => {
    expect(
      shouldExpandActivityDetails(
        { notes: "Booking ref 123", type: "attraction" },
        "edit",
      ),
    ).toBe(true);
  });

  it("expands on edit when activity type differs from default", () => {
    expect(
      shouldExpandActivityDetails({ notes: "", type: "restaurant" }, "edit"),
    ).toBe(true);
  });
});
