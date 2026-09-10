import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const { setOAuthStateCookieMock, buildGoogleAuthorizationUrlMock } = vi.hoisted(
  () => ({
    setOAuthStateCookieMock: vi.fn(),
    buildGoogleAuthorizationUrlMock: vi.fn(),
  }),
);

vi.mock("@/features/auth/google/oauth-state", () => ({
  generateOAuthState: () => "state-abc",
  setOAuthStateCookie: setOAuthStateCookieMock,
}));

vi.mock("@/features/auth/google/oauth-client", () => ({
  buildGoogleAuthorizationUrl: buildGoogleAuthorizationUrlMock,
}));

function makeRequest(url: string) {
  return new Request(url) as unknown as import("next/server").NextRequest & {
    nextUrl: URL;
  };
}

describe("GET /auth/google", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setOAuthStateCookieMock.mockResolvedValue(undefined);
    buildGoogleAuthorizationUrlMock.mockReturnValue(
      "https://accounts.google.com/o/oauth2/v2/auth?state=state-abc",
    );
  });

  it("stores OAuth state and redirects to Google", async () => {
    const request = makeRequest("http://localhost:3000/auth/google");
    Object.defineProperty(request, "nextUrl", {
      value: new URL(request.url),
    });

    const response = await GET(request);

    expect(setOAuthStateCookieMock).toHaveBeenCalledWith({
      state: "state-abc",
      next: null,
    });
    expect(buildGoogleAuthorizationUrlMock).toHaveBeenCalledWith(
      "http://localhost:3000",
      "state-abc",
    );
    expect(response.headers.get("location")).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth?state=state-abc",
    );
  });

  it("does not accept invalid next paths", async () => {
    const request = makeRequest(
      "http://localhost:3000/auth/google?next=https%3A%2F%2Fevil.com",
    );
    Object.defineProperty(request, "nextUrl", {
      value: new URL(request.url),
    });

    await GET(request);

    expect(setOAuthStateCookieMock).toHaveBeenCalledWith({
      state: "state-abc",
      next: null,
    });
  });
});
