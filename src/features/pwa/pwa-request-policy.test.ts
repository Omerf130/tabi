import { describe, expect, it } from "vitest";
import {
  classifyPwaRequest,
  isPublicCacheEligiblePath,
  isPrivateAppPath,
  PwaCachePolicy,
  shouldServeOfflineDocumentFallback,
  type PwaRequestInput,
} from "./pwa-request-policy";

function req(partial: Partial<PwaRequestInput> & { url: string }): PwaRequestInput {
  return {
    method: "GET",
    headers: {},
    ...partial,
  };
}

describe("classifyPwaRequest — NetworkOnly", () => {
  it.each([
    ["/app/trips/trip-1", "GET"],
    ["/app/trips/trip-1/documents/doc-1/file", "GET"],
    ["/app/users/user-1/profile-image", "GET"],
    ["/app/api/places/autocomplete", "GET"],
    ["/auth/google", "GET"],
    ["/login", "GET"],
    ["/register", "GET"],
    ["/invite/token-abc", "GET"],
    ["/_next/image?url=%2Fapp%2Ftrips%2Fx%2Fcover", "GET"],
    ["/unknown/path", "GET"],
  ])("treats %s as NetworkOnly", (pathname) => {
    expect(
      classifyPwaRequest(req({ url: `https://tabi.example${pathname}` })),
    ).toBe(PwaCachePolicy.NetworkOnly);
  });

  it("treats POST as NetworkOnly", () => {
    expect(
      classifyPwaRequest(
        req({ method: "POST", url: "https://tabi.example/app/trips/x" }),
      ),
    ).toBe(PwaCachePolicy.NetworkOnly);
  });

  it("treats Next-Action POST as NetworkOnly", () => {
    expect(
      classifyPwaRequest(
        req({
          method: "POST",
          url: "https://tabi.example/app/trips/x",
          headers: { "next-action": "abc123" },
        }),
      ),
    ).toBe(PwaCachePolicy.NetworkOnly);
  });

  it("treats RSC header as NetworkOnly", () => {
    expect(
      classifyPwaRequest(
        req({
          url: "https://tabi.example/app/trips/x",
          headers: { rsc: "1" },
        }),
      ),
    ).toBe(PwaCachePolicy.NetworkOnly);
  });

  it("treats Accept text/x-component as NetworkOnly", () => {
    expect(
      classifyPwaRequest(
        req({
          url: "https://tabi.example/app/trips/x",
          headers: { accept: "text/x-component" },
        }),
      ),
    ).toBe(PwaCachePolicy.NetworkOnly);
  });

  it("treats _rsc query as NetworkOnly", () => {
    expect(
      classifyPwaRequest(
        req({ url: "https://tabi.example/app/trips/x?_rsc=abc" }),
      ),
    ).toBe(PwaCachePolicy.NetworkOnly);
  });

  it("treats Serwist script as NetworkOnly", () => {
    expect(
      classifyPwaRequest(
        req({ url: "https://tabi.example/serwist/sw.js" }),
      ),
    ).toBe(PwaCachePolicy.NetworkOnly);
  });

  it("does not cache private app image-like URLs", () => {
    expect(
      classifyPwaRequest(
        req({
          url: "https://tabi.example/app/trips/x/cover",
        }),
      ),
    ).toBe(PwaCachePolicy.NetworkOnly);
    expect(isPrivateAppPath("/app/trips/x/cover")).toBe(true);
    expect(isPublicCacheEligiblePath("/app/trips/x/cover")).toBe(false);
  });

  it("treats HTML document navigations as NetworkOnly", () => {
    expect(
      classifyPwaRequest(
        req({
          url: "https://tabi.example/",
          destination: "document",
        }),
      ),
    ).toBe(PwaCachePolicy.NetworkOnly);
  });
});

describe("classifyPwaRequest — public cache eligible", () => {
  it.each([
    "/_next/static/chunks/example.js",
    "/icons/icon-192.png",
    "/themes/ocean/wave.png",
    "/destination-visuals/homeApp.png",
    "/transport-visuals/train.png",
    "/theme-atmosphere/ocean-waves.svg",
  ])("allows public caching policy for %s", (pathname) => {
    const policy = classifyPwaRequest(
      req({ url: `https://tabi.example${pathname}`, destination: "image" }),
    );
    expect(policy).not.toBe(PwaCachePolicy.NetworkOnly);
  });

  it("uses CacheFirst for immutable static assets", () => {
    expect(
      classifyPwaRequest(
        req({
          url: "https://tabi.example/_next/static/chunks/main.js",
          destination: "script",
        }),
      ),
    ).toBe(PwaCachePolicy.PublicCacheFirstStatic);
  });

  it("uses StaleWhileRevalidate for public decorative assets", () => {
    expect(
      classifyPwaRequest(
        req({
          url: "https://tabi.example/themes/ocean/wave.png",
          destination: "image",
        }),
      ),
    ).toBe(PwaCachePolicy.PublicStaleWhileRevalidate);
  });
});

describe("shouldServeOfflineDocumentFallback", () => {
  it("does not change Phase 2 NetworkOnly classification for /app GET", () => {
    expect(
      classifyPwaRequest(
        req({ url: "https://tabi.example/app/trips/x", destination: "document" }),
      ),
    ).toBe(PwaCachePolicy.NetworkOnly);
  });

  it("allows navigate mode for deep links while only serving generic offline HTML", () => {
    expect(
      shouldServeOfflineDocumentFallback({
        url: "https://tabi.example/app/trips/123/itinerary",
        method: "GET",
        headers: {},
        mode: "navigate",
        destination: "document",
      }),
    ).toBe(true);
  });
});
