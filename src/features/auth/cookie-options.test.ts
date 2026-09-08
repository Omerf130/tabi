import { describe, expect, it } from "vitest";
import { sessionCookieOptions } from "./cookie-options";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "./constants";

describe("session cookie options", () => {
  it("is HttpOnly, Lax, path /, and 7 days", () => {
    const options = sessionCookieOptions(false);
    expect(SESSION_COOKIE_NAME).toBe("tabi_session");
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.maxAge).toBe(SESSION_MAX_AGE_SECONDS);
    expect(SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 7);
    expect(options.secure).toBe(false);
  });

  it("sets secure in production", () => {
    expect(sessionCookieOptions(true).secure).toBe(true);
  });
});
