import { describe, expect, it } from "vitest";
import {
  acceptInviteSchema,
  createInviteSchema,
} from "./schemas";

describe("invitation schemas", () => {
  it("accepts only owner or member roles for create", () => {
    expect(
      createInviteSchema.safeParse({
        tripId: "507f1f77bcf86cd799439011",
        role: "owner",
      }).success,
    ).toBe(true);
    expect(
      createInviteSchema.safeParse({
        tripId: "507f1f77bcf86cd799439011",
        role: "member",
      }).success,
    ).toBe(true);
    expect(
      createInviteSchema.safeParse({
        tripId: "507f1f77bcf86cd799439011",
        role: "admin",
      }).success,
    ).toBe(false);
  });

  it("accept schema has token only and no role field", () => {
    const parsed = acceptInviteSchema.safeParse({
      token: "abcdefghijklmnopqrstuvwxyz0123456789-_",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({
        token: "abcdefghijklmnopqrstuvwxyz0123456789-_",
      });
      expect("role" in parsed.data).toBe(false);
    }
  });

  it("rejects tampered accept payloads with role", () => {
    expect(
      acceptInviteSchema.safeParse({
        token: "abcdefghijklmnopqrstuvwxyz0123456789-_",
        role: "owner",
      }).success,
    ).toBe(true);
    if (
      acceptInviteSchema.safeParse({
        token: "abcdefghijklmnopqrstuvwxyz0123456789-_",
        role: "owner",
      }).success
    ) {
      const parsed = acceptInviteSchema.parse({
        token: "abcdefghijklmnopqrstuvwxyz0123456789-_",
        role: "owner",
      });
      expect("role" in parsed).toBe(false);
    }
  });
});
