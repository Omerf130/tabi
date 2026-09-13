import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("sync-locale route", () => {
  it("sets tabi_locale in a route handler instead of layout render", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/auth/sync-locale/route.ts"),
      "utf8",
    );

    expect(source).toContain('response.cookies.set(');
    expect(source).toContain("LOCALE_COOKIE_NAME");
    expect(source).toContain("resolveAppLocale(user.locale)");
    expect(source).not.toContain("setLocaleCookie");
  });
});
