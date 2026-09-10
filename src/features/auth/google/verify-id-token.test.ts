import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleIdentityInvalidError } from "./errors";
import { verifyGoogleIdToken } from "./verify-id-token";

const verifyIdTokenMock = vi.fn();
const getPayloadMock = vi.fn();

vi.mock("google-auth-library", () => ({
  OAuth2Client: vi.fn().mockImplementation(() => ({
    verifyIdToken: verifyIdTokenMock,
  })),
}));

vi.mock("./oauth-client", () => ({
  getGoogleOAuthClientIdForVerification: () => "test-client-id",
}));

describe("verifyGoogleIdToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyIdTokenMock.mockResolvedValue({
      getPayload: getPayloadMock,
    });
  });

  it("returns verified identity fields", async () => {
    getPayloadMock.mockReturnValue({
      sub: "google-sub-123",
      email: "Traveler@Example.com",
      email_verified: true,
      name: "Traveler Example",
    });

    await expect(verifyGoogleIdToken("id-token")).resolves.toEqual({
      sub: "google-sub-123",
      email: "traveler@example.com",
      name: "Traveler Example",
      emailVerified: true,
    });
  });

  it("rejects unverified Google email", async () => {
    getPayloadMock.mockReturnValue({
      sub: "google-sub-123",
      email: "traveler@example.com",
      email_verified: false,
    });

    await expect(verifyGoogleIdToken("id-token")).rejects.toBeInstanceOf(
      GoogleIdentityInvalidError,
    );
  });

  it("rejects missing email or sub", async () => {
    getPayloadMock.mockReturnValue({
      email_verified: true,
    });

    await expect(verifyGoogleIdToken("id-token")).rejects.toBeInstanceOf(
      GoogleIdentityInvalidError,
    );
  });
});
