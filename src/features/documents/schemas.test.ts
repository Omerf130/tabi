import { describe, expect, it } from "vitest";
import {
  createTravelDocumentSchema,
  travelDocumentMetadataSchema,
  updateTravelDocumentSchema,
} from "./schemas";

const tripId = "507f1f77bcf86cd799439011";
const documentId = "507f1f77bcf86cd799439012";
const activityId = "507f1f77bcf86cd799439013";
const accommodationId = "507f1f77bcf86cd799439014";
const transportId = "507f1f77bcf86cd799439016";

describe("travel document schemas", () => {
  it("accepts valid metadata", () => {
    const result = travelDocumentMetadataSchema.safeParse({
      title: "Boarding pass",
      category: "flight",
      description: "Outbound",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid category", () => {
    const result = travelDocumentMetadataSchema.safeParse({
      title: "Doc",
      category: "visa",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title on metadata update", () => {
    const result = travelDocumentMetadataSchema.safeParse({
      title: "   ",
      category: "other",
    });
    expect(result.success).toBe(false);
  });

  it("rejects long title", () => {
    const result = travelDocumentMetadataSchema.safeParse({
      title: "x".repeat(121),
      category: "other",
    });
    expect(result.success).toBe(false);
  });

  it("rejects long description", () => {
    const result = travelDocumentMetadataSchema.safeParse({
      title: "Doc",
      category: "other",
      description: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid object ids", () => {
    const result = travelDocumentMetadataSchema.safeParse({
      title: "Doc",
      category: "other",
      activityId: "bad-id",
    });
    expect(result.success).toBe(false);
  });

  it("accepts activity link only", () => {
    const result = travelDocumentMetadataSchema.safeParse({
      title: "Ticket",
      category: "ticket",
      activityId,
    });
    expect(result.success).toBe(true);
  });

  it("accepts accommodation link only", () => {
    const result = travelDocumentMetadataSchema.safeParse({
      title: "Hotel voucher",
      category: "accommodation",
      accommodationId,
    });
    expect(result.success).toBe(true);
  });

  it("rejects activity and accommodation together", () => {
    const result = travelDocumentMetadataSchema.safeParse({
      title: "Doc",
      category: "other",
      activityId,
      accommodationId,
    });
    expect(result.success).toBe(false);
  });

  it("accepts transport link only", () => {
    const result = travelDocumentMetadataSchema.safeParse({
      title: "Train ticket",
      category: "train",
      transportId,
    });
    expect(result.success).toBe(true);
  });

  it("rejects multiple context links", () => {
    const result = travelDocumentMetadataSchema.safeParse({
      title: "Doc",
      category: "other",
      activityId,
      transportId,
    });
    expect(result.success).toBe(false);
  });

  it("accepts create schema without title", () => {
    const result = createTravelDocumentSchema.safeParse({
      tripId,
      category: "insurance",
    });
    expect(result.success).toBe(true);
  });

  it("accepts update schema with document id", () => {
    const result = updateTravelDocumentSchema.safeParse({
      tripId,
      documentId,
      title: "Updated",
      category: "reservation",
    });
    expect(result.success).toBe(true);
  });
});
