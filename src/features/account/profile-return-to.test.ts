import { describe, expect, it } from "vitest";
import {
  buildProfileHrefWithReturnTo,
  buildSettingsProfileHref,
  sanitizeProfileReturnTo,
} from "./profile-return-to";

const tripId = "507f1f77bcf86cd799439011";

describe("sanitizeProfileReturnTo", () => {
  it("accepts allowed internal paths", () => {
    expect(sanitizeProfileReturnTo("/app")).toBe("/app");
    expect(sanitizeProfileReturnTo(`/app/trips/${tripId}/manage`)).toBe(
      `/app/trips/${tripId}/manage`,
    );
    expect(sanitizeProfileReturnTo(`/app/trips/${tripId}/manage/language`)).toBe(
      `/app/trips/${tripId}/manage/language`,
    );
  });

  it("rejects external and malicious paths", () => {
    expect(sanitizeProfileReturnTo("https://evil.example")).toBe("/app");
    expect(sanitizeProfileReturnTo("//evil.example")).toBe("/app");
    expect(sanitizeProfileReturnTo("/app/account/profile?x=1")).toBe("/app");
    expect(sanitizeProfileReturnTo("javascript:alert(1)")).toBe("/app");
  });

  it("falls back to /app for invalid input", () => {
    expect(sanitizeProfileReturnTo(null)).toBe("/app");
    expect(sanitizeProfileReturnTo("")).toBe("/app");
  });
});

describe("buildProfileHrefWithReturnTo", () => {
  it("encodes a sanitized return path", () => {
    const href = buildProfileHrefWithReturnTo(`/app/trips/${tripId}/manage`);
    expect(href).toBe(
      `/app/account/profile?returnTo=${encodeURIComponent(`/app/trips/${tripId}/manage`)}`,
    );
  });
});

describe("buildSettingsProfileHref", () => {
  it("returns profile with manage returnTo", () => {
    expect(buildSettingsProfileHref(tripId)).toBe(
      buildProfileHrefWithReturnTo(`/app/trips/${tripId}/manage`),
    );
  });
});
