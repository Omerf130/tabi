import { describe, expect, it } from "vitest";
import { isSessionExpired } from "./session-expiry";

describe("isSessionExpired", () => {
  it("rejects timestamps in the past or now", () => {
    const now = new Date("2026-09-08T10:00:00.000Z");
    expect(isSessionExpired(new Date("2026-09-08T09:59:59.000Z"), now)).toBe(
      true,
    );
    expect(isSessionExpired(now, now)).toBe(true);
  });

  it("accepts a future expiry", () => {
    const now = new Date("2026-09-08T10:00:00.000Z");
    expect(isSessionExpired(new Date("2026-09-08T10:00:01.000Z"), now)).toBe(
      false,
    );
  });
});
