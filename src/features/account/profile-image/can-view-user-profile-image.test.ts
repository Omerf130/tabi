import { beforeEach, describe, expect, it, vi } from "vitest";
import { usersShareTripMembership } from "./can-view-user-profile-image";

const { distinctMock, existsMock } = vi.hoisted(() => ({
  distinctMock: vi.fn(),
  existsMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/TripMember", () => ({
  TripMember: {
    find: vi.fn(() => ({
      distinct: distinctMock,
    })),
    exists: existsMock,
  },
}));

describe("usersShareTripMembership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows self", async () => {
    await expect(
      usersShareTripMembership("user-a", "user-a"),
    ).resolves.toBe(true);
  });

  it("allows shared trip members", async () => {
    distinctMock.mockReturnValue({
      exec: vi.fn().mockResolvedValue(["trip-1"]),
    });
    existsMock.mockResolvedValue({ _id: "x" });
    await expect(
      usersShareTripMembership("viewer", "target"),
    ).resolves.toBe(true);
  });

  it("denies unrelated users", async () => {
    distinctMock.mockReturnValue({
      exec: vi.fn().mockResolvedValue(["trip-1"]),
    });
    existsMock.mockResolvedValue(null);
    await expect(
      usersShareTripMembership("viewer", "target"),
    ).resolves.toBe(false);
  });
});
