import { describe, expect, it, vi } from "vitest";
import { resolveRequestLocaleFromInput } from "./resolve-request-locale";

describe("resolveRequestLocaleFromInput", () => {
  it("uses valid cookie without recovery lookup", async () => {
    const recoverUserLocale = vi.fn(async () => "en" as const);

    await expect(
      resolveRequestLocaleFromInput({
        cookieLocale: "en",
        hasSessionCookie: true,
        recoverUserLocale,
      }),
    ).resolves.toBe("en");

    expect(recoverUserLocale).not.toHaveBeenCalled();
  });

  it("defaults unauthenticated requests without cookie to Hebrew", async () => {
    const recoverUserLocale = vi.fn(async () => null);

    await expect(
      resolveRequestLocaleFromInput({
        cookieLocale: undefined,
        hasSessionCookie: false,
        recoverUserLocale,
      }),
    ).resolves.toBe("he");

    expect(recoverUserLocale).not.toHaveBeenCalled();
  });

  it("recovers authenticated locale when cookie is missing", async () => {
    const recoverUserLocale = vi.fn(async () => "en" as const);

    await expect(
      resolveRequestLocaleFromInput({
        cookieLocale: undefined,
        hasSessionCookie: true,
        recoverUserLocale,
      }),
    ).resolves.toBe("en");

    expect(recoverUserLocale).toHaveBeenCalledOnce();
  });

  it("recovers authenticated locale when cookie is invalid", async () => {
    const recoverUserLocale = vi.fn(async () => "he" as const);

    await expect(
      resolveRequestLocaleFromInput({
        cookieLocale: "fr",
        hasSessionCookie: true,
        recoverUserLocale,
      }),
    ).resolves.toBe("he");

    expect(recoverUserLocale).toHaveBeenCalledOnce();
  });

  it("falls back to Hebrew when recovery fails", async () => {
    const recoverUserLocale = vi.fn(async () => null);

    await expect(
      resolveRequestLocaleFromInput({
        cookieLocale: undefined,
        hasSessionCookie: true,
        recoverUserLocale,
      }),
    ).resolves.toBe("he");
  });
});
