import { describe, expect, it } from "vitest";
import {
  getInvitationStatus,
  isInvitationValid,
  toPublicInviteState,
} from "./public-invite";

describe("public invite DTO", () => {
  const now = new Date("2026-01-01T12:00:00.000Z");
  const future = new Date("2026-01-08T12:00:00.000Z");
  const past = new Date("2025-12-25T12:00:00.000Z");

  it("maps valid invite without secrets", () => {
    const dto = toPublicInviteState({
      status: "valid",
      tripName: "Japan",
      role: "member",
      expiresAt: future,
    });
    expect(dto).toEqual({
      status: "valid",
      tripName: "Japan",
      role: "member",
      expiresAt: future.toISOString(),
    });
  });

  it("groups invalid states", () => {
    expect(toPublicInviteState({ status: "invalid" })).toEqual({
      status: "invalid",
    });
  });

  it("checks expiry, revocation, and used state", () => {
    expect(
      isInvitationValid(
        { usedAt: null, revokedAt: null, expiresAt: future },
        now,
      ),
    ).toBe(true);
    expect(
      isInvitationValid(
        { usedAt: now, revokedAt: null, expiresAt: future },
        now,
      ),
    ).toBe(false);
    expect(
      isInvitationValid(
        { usedAt: null, revokedAt: now, expiresAt: future },
        now,
      ),
    ).toBe(false);
    expect(
      isInvitationValid(
        { usedAt: null, revokedAt: null, expiresAt: past },
        now,
      ),
    ).toBe(false);
  });

  it("derives invitation status labels", () => {
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
    expect(
      getInvitationStatus(
        { usedAt: null, revokedAt: null, expiresAt: future },
        now,
      ),
    ).toBe("active");
  });
});
