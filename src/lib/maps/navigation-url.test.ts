import { describe, expect, it } from "vitest";
import {
  buildNavigationUrl,
  isSafeHttpNavigationUrl,
} from "./navigation-url";
import { resolvePreferredMapsApp } from "./maps-app";

describe("resolvePreferredMapsApp", () => {
  it("returns google when unset", () => {
    expect(resolvePreferredMapsApp(null)).toBe("google");
    expect(resolvePreferredMapsApp(undefined)).toBe("google");
  });

  it("returns explicit values", () => {
    expect(resolvePreferredMapsApp("waze")).toBe("waze");
    expect(resolvePreferredMapsApp("apple")).toBe("apple");
  });
});

describe("isSafeHttpNavigationUrl", () => {
  it("accepts http and https only", () => {
    expect(isSafeHttpNavigationUrl("https://maps.example/x")).toBe(true);
    expect(isSafeHttpNavigationUrl("http://maps.example/x")).toBe(true);
    expect(isSafeHttpNavigationUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpNavigationUrl("data:text/html,x")).toBe(false);
  });
});

describe("buildNavigationUrl — Google", () => {
  it("prefers safe persisted googleMapsUrl", () => {
    expect(
      buildNavigationUrl({
        provider: "google",
        googleMapsUrl: "https://maps.google.com/?cid=123",
        latitude: 35,
        longitude: 139,
      }),
    ).toBe("https://maps.google.com/?cid=123");
  });

  it("uses coordinates when no safe persisted url", () => {
    const url = buildNavigationUrl({
      provider: "google",
      latitude: 35.6762,
      longitude: 139.6503,
    });
    expect(url).toContain("35.6762");
    expect(url).toContain("google.com/maps");
  });

  it("uses address fallback", () => {
    expect(
      buildNavigationUrl({
        provider: "google",
        address: "Tokyo Station",
      }),
    ).toBe(
      "https://www.google.com/maps/search/?api=1&query=Tokyo%20Station",
    );
  });

  it("encodes unicode address", () => {
    const url = buildNavigationUrl({
      provider: "google",
      address: "東京駅",
    });
    expect(url).toContain(encodeURIComponent("東京駅"));
  });

  it("ignores javascript persisted url", () => {
    const url = buildNavigationUrl({
      provider: "google",
      googleMapsUrl: "javascript:alert(1)",
      address: "Tokyo",
    });
    expect(url).toContain("Tokyo");
    expect(url).not.toContain("javascript");
  });

  it("returns null when no destination", () => {
    expect(buildNavigationUrl({ provider: "google" })).toBeNull();
  });
});

describe("buildNavigationUrl — Waze", () => {
  it("builds coordinate url", () => {
    expect(
      buildNavigationUrl({
        provider: "waze",
        latitude: 35.67,
        longitude: 139.65,
      }),
    ).toBe("https://waze.com/ul?ll=35.67%2C139.65&navigate=yes");
  });

  it("builds address url and ignores googleMapsUrl", () => {
    expect(
      buildNavigationUrl({
        provider: "waze",
        address: "Shibuya",
        googleMapsUrl: "https://maps.google.com/?cid=1",
      }),
    ).toBe("https://waze.com/ul?q=Shibuya&navigate=yes");
  });

  it("returns null without destination", () => {
    expect(buildNavigationUrl({ provider: "waze" })).toBeNull();
  });
});

describe("buildNavigationUrl — Apple", () => {
  it("builds coordinate url", () => {
    expect(
      buildNavigationUrl({
        provider: "apple",
        latitude: 35.67,
        longitude: 139.65,
      }),
    ).toBe("https://maps.apple.com/?ll=35.67%2C139.65");
  });

  it("builds address url", () => {
    expect(
      buildNavigationUrl({
        provider: "apple",
        label: "Hotel",
      }),
    ).toBe("https://maps.apple.com/?q=Hotel");
  });

  it("ignores googleMapsUrl", () => {
    const url = buildNavigationUrl({
      provider: "apple",
      googleMapsUrl: "https://maps.google.com/?cid=1",
      address: "Osaka",
    });
    expect(url).toContain("maps.apple.com");
    expect(url).not.toContain("google");
  });
});
