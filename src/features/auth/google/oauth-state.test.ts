import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleOAuthStateError } from "./errors";
import { consumeOAuthState } from "./oauth-state";

const { cookiesMock, getMock, setMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  getMock: vi.fn(),
  setMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

describe("consumeOAuthState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookiesMock.mockResolvedValue({
      get: getMock,
      set: setMock,
    });
  });

  it("accepts a matching state once and clears the cookie", async () => {
    getMock.mockReturnValue({
      value: JSON.stringify({
        state: "state-abc",
        next: "/app/trips/507f1f77bcf86cd799439011",
      }),
    });

    await expect(consumeOAuthState("state-abc")).resolves.toEqual({
      state: "state-abc",
      next: "/app/trips/507f1f77bcf86cd799439011",
    });
    expect(setMock).toHaveBeenCalled();
  });

  it("rejects a state mismatch", async () => {
    getMock.mockReturnValue({
      value: JSON.stringify({ state: "state-abc", next: null }),
    });

    await expect(consumeOAuthState("state-xyz")).rejects.toBeInstanceOf(
      GoogleOAuthStateError,
    );
  });

  it("rejects missing stored state", async () => {
    getMock.mockReturnValue(undefined);

    await expect(consumeOAuthState("state-abc")).rejects.toBeInstanceOf(
      GoogleOAuthStateError,
    );
  });

  it("rejects state reuse after the cookie is cleared", async () => {
    getMock.mockReturnValueOnce({
      value: JSON.stringify({ state: "state-abc", next: null }),
    });
    getMock.mockReturnValueOnce(undefined);

    await expect(consumeOAuthState("state-abc")).resolves.toEqual({
      state: "state-abc",
      next: null,
    });

    await expect(consumeOAuthState("state-abc")).rejects.toBeInstanceOf(
      GoogleOAuthStateError,
    );
  });
});
