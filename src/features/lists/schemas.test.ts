import { describe, expect, it } from "vitest";
import {
  createTripListItemSchema,
  deleteTripListItemSchema,
  listSlugParamSchema,
  setTripListItemCompletedSchema,
  updateTripListItemSchema,
} from "./schemas";

const tripId = "507f1f77bcf86cd799439011";
const itemId = "507f1f77bcf86cd799439012";

describe("trip list schemas", () => {
  it("validates create item input", () => {
    const result = createTripListItemSchema.safeParse({
      tripId,
      listType: "packing",
      text: "דרכון",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty item text", () => {
    const result = createTripListItemSchema.safeParse({
      tripId,
      listType: "packing",
      text: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("validates list slugs", () => {
    expect(listSlugParamSchema.safeParse({ listSlug: "packing" }).success).toBe(
      true,
    );
    expect(
      listSlugParamSchema.safeParse({ listSlug: "invalid-slug" }).success,
    ).toBe(false);
  });

  it("parses completion state from strings", () => {
    expect(
      setTripListItemCompletedSchema.safeParse({
        tripId,
        itemId,
        isCompleted: "true",
      }).success,
    ).toBe(true);
    expect(
      setTripListItemCompletedSchema.safeParse({
        tripId,
        itemId,
        isCompleted: "false",
      }).success,
    ).toBe(true);
  });

  it("validates update and delete mutations", () => {
    expect(
      updateTripListItemSchema.safeParse({
        tripId,
        itemId,
        text: "מטען",
      }).success,
    ).toBe(true);
    expect(
      deleteTripListItemSchema.safeParse({
        tripId,
        itemId,
      }).success,
    ).toBe(true);
  });
});
