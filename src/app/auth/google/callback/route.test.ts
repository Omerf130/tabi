import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const {
  consumeOAuthStateMock,
  exchangeGoogleAuthorizationCodeMock,
  verifyGoogleIdTokenMock,
  resolveGoogleUserMock,
  createSessionMock,
} = vi.hoisted(() => ({
  consumeOAuthStateMock: vi.fn(),
  exchangeGoogleAuthorizationCodeMock: vi.fn(),
  verifyGoogleIdTokenMock: vi.fn(),
  resolveGoogleUserMock: vi.fn(),
  createSessionMock: vi.fn(),
}));

vi.mock("@/features/auth/google/oauth-state", () => ({
  consumeOAuthState: consumeOAuthStateMock,
}));

vi.mock("@/features/auth/google/oauth-client", () => ({
  exchangeGoogleAuthorizationCode: exchangeGoogleAuthorizationCodeMock,
}));

vi.mock("@/features/auth/google/verify-id-token", () => ({
  verifyGoogleIdToken: verifyGoogleIdTokenMock,
}));

vi.mock("@/features/auth/google/resolve-google-user", () => ({
  resolveGoogleUser: resolveGoogleUserMock,
}));

vi.mock("@/features/auth/session", () => ({
  createSession: createSessionMock,
}));

function makeRequest(url: string) {
  return new Request(url) as unknown as import("next/server").NextRequest & {
    nextUrl: URL;
  };
}

describe("GET /auth/google/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consumeOAuthStateMock.mockResolvedValue({ state: "state-abc", next: null });
    exchangeGoogleAuthorizationCodeMock.mockResolvedValue({ idToken: "id-token" });
    verifyGoogleIdTokenMock.mockResolvedValue({
      sub: "google-sub-123",
      email: "traveler@example.com",
      emailVerified: true,
    });
    resolveGoogleUserMock.mockResolvedValue({ _id: { toString: () => "user-1" } });
    createSessionMock.mockResolvedValue(undefined);
  });

  it("creates an existing Tabi session and redirects to /app", async () => {
    const request = makeRequest(
      "http://localhost:3000/auth/google/callback?code=abc&state=state-abc",
    );
    Object.defineProperty(request, "nextUrl", {
      value: new URL(request.url),
    });

    const response = await GET(request);

    expect(createSessionMock).toHaveBeenCalledWith("user-1");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/app");
  });

  it("redirects to sanitized next when provided in stored state", async () => {
    consumeOAuthStateMock.mockResolvedValue({
      state: "state-abc",
      next: "/app/trips/507f1f77bcf86cd799439011",
    });

    const request = makeRequest(
      "http://localhost:3000/auth/google/callback?code=abc&state=state-abc",
    );
    Object.defineProperty(request, "nextUrl", {
      value: new URL(request.url),
    });

    const response = await GET(request);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/app/trips/507f1f77bcf86cd799439011",
    );
  });

  it("redirects to login with a generic Google error on failure", async () => {
    consumeOAuthStateMock.mockRejectedValue(new Error("state mismatch"));

    const request = makeRequest(
      "http://localhost:3000/auth/google/callback?code=abc&state=state-abc",
    );
    Object.defineProperty(request, "nextUrl", {
      value: new URL(request.url),
    });

    const response = await GET(request);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=google",
    );
    expect(createSessionMock).not.toHaveBeenCalled();
  });

  it("redirects to login when Google returns an error response", async () => {
    const request = makeRequest(
      "http://localhost:3000/auth/google/callback?error=access_denied",
    );
    Object.defineProperty(request, "nextUrl", {
      value: new URL(request.url),
    });

    const response = await GET(request);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=google",
    );
  });
});
