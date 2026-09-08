import { describe, expect, it } from "vitest";
import { TRAVEL_DOCUMENT_MAX_BYTES } from "./constants";
import { validateTravelDocumentFile } from "./validate-travel-document-file";

const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0x00]);
const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d]);
const WEBP_BYTES = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);

describe("validateTravelDocumentFile", () => {
  it("accepts valid PDF bytes", () => {
    const result = validateTravelDocumentFile({
      size: PDF_BYTES.length,
      bytes: PDF_BYTES,
      declaredType: "application/pdf",
    });
    expect(result).toEqual({ ok: true, contentType: "application/pdf" });
  });

  it("accepts valid JPEG bytes", () => {
    const result = validateTravelDocumentFile({
      size: JPEG_BYTES.length,
      bytes: JPEG_BYTES,
      declaredType: "image/jpeg",
    });
    expect(result).toEqual({ ok: true, contentType: "image/jpeg" });
  });

  it("accepts valid PNG bytes", () => {
    const result = validateTravelDocumentFile({
      size: PNG_BYTES.length,
      bytes: PNG_BYTES,
      declaredType: "image/png",
    });
    expect(result).toEqual({ ok: true, contentType: "image/png" });
  });

  it("accepts valid WebP bytes", () => {
    const result = validateTravelDocumentFile({
      size: WEBP_BYTES.length,
      bytes: WEBP_BYTES,
      declaredType: "image/webp",
    });
    expect(result).toEqual({ ok: true, contentType: "image/webp" });
  });

  it("rejects empty files", () => {
    const result = validateTravelDocumentFile({
      size: 0,
      bytes: new Uint8Array(),
    });
    expect(result).toEqual({ ok: false, error: "missing" });
  });

  it("rejects oversized files", () => {
    const result = validateTravelDocumentFile({
      size: TRAVEL_DOCUMENT_MAX_BYTES + 1,
      bytes: PDF_BYTES,
      declaredType: "application/pdf",
    });
    expect(result).toEqual({ ok: false, error: "tooLarge" });
  });

  it("rejects fake MIME types", () => {
    const result = validateTravelDocumentFile({
      size: JPEG_BYTES.length,
      bytes: JPEG_BYTES,
      declaredType: "application/pdf",
    });
    expect(result).toEqual({ ok: false, error: "invalidType" });
  });

  it("rejects spoofed extensions via signature validation", () => {
    const result = validateTravelDocumentFile({
      size: 3,
      bytes: new Uint8Array([0x00, 0x00, 0x00]),
      declaredType: "image/png",
    });
    expect(result).toEqual({ ok: false, error: "invalidType" });
  });
});
