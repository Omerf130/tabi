import { describe, expect, it } from "vitest";
import { travelerInitials } from "./traveler-initials";

describe("travelerInitials", () => {
  it("uses first letter for single name", () => {
    expect(travelerInitials("test3")).toBe("T");
  });

  it("uses first and last initials for multiple words", () => {
    expect(travelerInitials("Alex Blake")).toBe("AB");
  });
});
