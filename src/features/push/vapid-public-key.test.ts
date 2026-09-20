import { describe, expect, it } from "vitest";
import {
  InvalidVapidPublicKeyError,
  toApplicationServerKey,
  urlBase64ToUint8Array,
} from "./vapid-public-key";

describe("urlBase64ToUint8Array", () => {
  it("converts a URL-safe VAPID public key", () => {
    const bytes = urlBase64ToUint8Array(
      "BNcRdreALRFXTkOuoPKHSEncBsp7_nISoq7v683CC654bS0lDrMZHnr7n8_1dYx8fhvYDes3U3nT3SpDIi6KI7c",
    );
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
  });

  it("throws on invalid key material", () => {
    expect(() => urlBase64ToUint8Array("not!!!valid")).toThrow(
      InvalidVapidPublicKeyError,
    );
  });
});

describe("toApplicationServerKey", () => {
  it("returns Uint8Array for PushManager applicationServerKey", () => {
    const key = toApplicationServerKey(
      "BNcRdreALRFXTkOuoPKHSEncBsp7_nISoq7v683CC654bS0lDrMZHnr7n8_1dYx8fhvYDes3U3nT3SpDIi6KI7c",
    );
    expect(key.byteLength).toBeGreaterThan(0);
  });
});
