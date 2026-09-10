import { describe, expect, it } from "vitest";
import { buildGoogleAuthHref } from "./google-auth-href";

describe("buildGoogleAuthHref", () => {
  it("points to the shared Google auth start route", () => {
    expect(buildGoogleAuthHref()).toBe("/auth/google");
  });

  it("preserves a sanitized next path", () => {
    expect(
      buildGoogleAuthHref("/app/trips/507f1f77bcf86cd799439011"),
    ).toBe("/auth/google?next=%2Fapp%2Ftrips%2F507f1f77bcf86cd799439011");
  });
});
