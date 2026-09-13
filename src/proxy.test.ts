import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/features/auth/constants";
import { LOCALE_COOKIE_NAME } from "@/features/i18n/constants";
import { proxy } from "./proxy";

function request(path: string, cookies: Record<string, string> = {}) {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: {
      cookie: Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join("; "),
    },
  });
}

describe("proxy locale recovery", () => {
  it("redirects unauthenticated /app requests to login", () => {
    const response = proxy(request("/app/trips/abc/manage"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("redirects authenticated requests without locale cookie to sync-locale", () => {
    const response = proxy(
      request("/app/trips/abc/manage/details", {
        [SESSION_COOKIE_NAME]: "session-token",
      }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/sync-locale?next=%2Fapp%2Ftrips%2Fabc%2Fmanage%2Fdetails",
    );
  });

  it("allows authenticated requests with valid locale cookie", () => {
    const response = proxy(
      request("/app/trips/abc/manage", {
        [SESSION_COOKIE_NAME]: "session-token",
        [LOCALE_COOKIE_NAME]: "en",
      }),
    );
    expect(response.status).toBe(200);
  });
});
