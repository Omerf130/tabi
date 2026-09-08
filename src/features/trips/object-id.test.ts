import { describe, expect, it } from "vitest";
import { isValidObjectId } from "./object-id";

describe("isValidObjectId", () => {
  it("accepts valid 24-hex ids", () => {
    expect(isValidObjectId("507f1f77bcf86cd799439011")).toBe(true);
  });

  it("rejects malformed ids", () => {
    expect(isValidObjectId("not-an-object-id")).toBe(false);
    expect(isValidObjectId("507f1f77bcf86cd79943901")).toBe(false);
  });
});
