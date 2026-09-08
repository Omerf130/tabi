import { describe, expect, it } from "vitest";
import { validateTripCoverUpload } from "./validate-trip-cover";

describe("validateTripCoverUpload", () => {
  it("accepts valid JPEG bytes", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0x00, 0x01]);
    const result = validateTripCoverUpload({
      size: bytes.length,
      bytes,
      declaredType: "image/jpeg",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.contentType).toBe("image/jpeg");
    }
  });

  it("rejects oversized uploads", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff]);
    const result = validateTripCoverUpload({
      size: 6 * 1024 * 1024,
      bytes,
      declaredType: "image/jpeg",
    });

    expect(result).toEqual({ ok: false, error: "tooLarge" });
  });

  it("rejects invalid file signatures", () => {
    const bytes = new Uint8Array([0x00, 0x00, 0x00]);
    const result = validateTripCoverUpload({
      size: bytes.length,
      bytes,
      declaredType: "image/png",
    });

    expect(result).toEqual({ ok: false, error: "invalidType" });
  });

  it("rejects missing files", () => {
    const result = validateTripCoverUpload({
      size: 0,
      bytes: new Uint8Array(),
    });

    expect(result).toEqual({ ok: false, error: "missing" });
  });
});
