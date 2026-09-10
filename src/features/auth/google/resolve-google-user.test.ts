import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GoogleAccountConflictError,
  GoogleIdentityInvalidError,
} from "./errors";
import { resolveGoogleUser } from "./resolve-google-user";
import type { VerifiedGoogleIdentity } from "./verify-id-token";

const {
  connectDbMock,
  findOneMock,
  findByIdMock,
  findOneAndUpdateMock,
  createMock,
} = vi.hoisted(() => ({
  connectDbMock: vi.fn(),
  findOneMock: vi.fn(),
  findByIdMock: vi.fn(),
  findOneAndUpdateMock: vi.fn(),
  createMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: connectDbMock,
}));

vi.mock("@/models/User", () => ({
  User: {
    findOne: findOneMock,
    findById: findByIdMock,
    findOneAndUpdate: findOneAndUpdateMock,
    create: createMock,
  },
}));

const identity: VerifiedGoogleIdentity = {
  sub: "google-sub-123",
  email: "traveler@example.com",
  name: "Traveler Example",
  emailVerified: true,
};

describe("resolveGoogleUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDbMock.mockResolvedValue(undefined);
  });

  it("authenticates an existing linked Google user", async () => {
    const existing = { _id: "user-1", googleSubject: "google-sub-123" };
    findOneMock.mockResolvedValueOnce(existing);

    await expect(resolveGoogleUser(identity)).resolves.toBe(existing);
    expect(findOneMock).toHaveBeenCalledWith({ googleSubject: "google-sub-123" });
  });

  it("links Google to an existing password user with the same email", async () => {
    const passwordUser = {
      _id: "user-2",
      email: "traveler@example.com",
      name: "Existing Name",
      passwordHash: "hash",
    };
    const linkedUser = { ...passwordUser, googleSubject: "google-sub-123" };

    findOneMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(passwordUser);
    findOneAndUpdateMock.mockResolvedValueOnce(linkedUser);

    await expect(resolveGoogleUser(identity)).resolves.toBe(linkedUser);
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      {
        _id: "user-2",
        googleSubject: { $exists: false },
      },
      { $set: { googleSubject: "google-sub-123" } },
      { new: true },
    );
  });

  it("creates a new Google-only user", async () => {
    const created = {
      _id: "user-3",
      email: "traveler@example.com",
      googleSubject: "google-sub-123",
    };

    findOneMock.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    createMock.mockResolvedValueOnce(created);

    await expect(resolveGoogleUser(identity)).resolves.toBe(created);
    expect(createMock).toHaveBeenCalledWith({
      name: "Traveler Example",
      email: "traveler@example.com",
      googleSubject: "google-sub-123",
      role: "user",
    });
  });

  it("rejects conflicting googleSubject for the same email", async () => {
    findOneMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        _id: "user-4",
        email: "traveler@example.com",
        googleSubject: "other-sub",
      });

    await expect(resolveGoogleUser(identity)).rejects.toBeInstanceOf(
      GoogleAccountConflictError,
    );
  });

  it("recovers from duplicate-key races by re-fetching the linked user", async () => {
    const racedUser = {
      _id: "user-5",
      email: "traveler@example.com",
      googleSubject: "google-sub-123",
    };

    findOneMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(racedUser);
    createMock.mockRejectedValueOnce({ code: 11000 });

    await expect(resolveGoogleUser(identity)).resolves.toBe(racedUser);
  });
});

describe("resolveGoogleUser identity validation", () => {
  it("rejects missing sub before database access", async () => {
    await expect(
      resolveGoogleUser({
        sub: "   ",
        email: "traveler@example.com",
        emailVerified: true,
      }),
    ).rejects.toBeInstanceOf(GoogleIdentityInvalidError);
  });
});
