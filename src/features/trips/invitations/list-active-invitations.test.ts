import { describe, expect, it } from "vitest";
import { getInvitationStatus } from "./public-invite";

describe("active invitation filtering semantics", () => {
  const now = new Date("2026-01-01T12:00:00.000Z");
  const future = new Date("2026-01-08T12:00:00.000Z");
  const past = new Date("2025-12-25T12:00:00.000Z");

  it("treats only non-used non-revoked future invites as active", () => {
    expect(
      getInvitationStatus(
        { usedAt: null, revokedAt: null, expiresAt: future },
        now,
      ),
    ).toBe("active");
    expect(
      getInvitationStatus(
        { usedAt: now, revokedAt: null, expiresAt: future },
        now,
      ),
    ).toBe("used");
    expect(
      getInvitationStatus(
        { usedAt: null, revokedAt: now, expiresAt: future },
        now,
      ),
    ).toBe("revoked");
    expect(
      getInvitationStatus(
        { usedAt: null, revokedAt: null, expiresAt: past },
        now,
      ),
    ).toBe("expired");
  });
});
