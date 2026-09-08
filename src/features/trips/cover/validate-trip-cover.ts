import {
  TRIP_COVER_ALLOWED_CONTENT_TYPES,
  TRIP_COVER_MAX_BYTES,
  type TripCoverContentType,
} from "./constants";

export type TripCoverValidationResult =
  | { ok: true; contentType: TripCoverContentType }
  | { ok: false; error: "missing" | "tooLarge" | "invalidType" };

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP_MARKER = [0x57, 0x45, 0x42, 0x50];

function hasPrefix(bytes: Uint8Array, prefix: readonly number[]): boolean {
  if (bytes.length < prefix.length) {
    return false;
  }
  return prefix.every((value, index) => bytes[index] === value);
}

function detectImageContentType(bytes: Uint8Array): TripCoverContentType | null {
  if (hasPrefix(bytes, JPEG_SIGNATURE)) {
    return "image/jpeg";
  }
  if (hasPrefix(bytes, PNG_SIGNATURE)) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    hasPrefix(bytes, WEBP_RIFF) &&
    bytes[8] === WEBP_MARKER[0] &&
    bytes[9] === WEBP_MARKER[1] &&
    bytes[10] === WEBP_MARKER[2] &&
    bytes[11] === WEBP_MARKER[3]
  ) {
    return "image/webp";
  }
  return null;
}

export function validateTripCoverUpload(input: {
  size: number;
  bytes: Uint8Array;
  declaredType?: string | null;
}): TripCoverValidationResult {
  if (input.size <= 0) {
    return { ok: false, error: "missing" };
  }

  if (input.size > TRIP_COVER_MAX_BYTES) {
    return { ok: false, error: "tooLarge" };
  }

  const detectedType = detectImageContentType(input.bytes);
  if (!detectedType) {
    return { ok: false, error: "invalidType" };
  }

  if (
    input.declaredType &&
    TRIP_COVER_ALLOWED_CONTENT_TYPES.includes(
      input.declaredType as TripCoverContentType,
    ) &&
    input.declaredType !== detectedType
  ) {
    return { ok: false, error: "invalidType" };
  }

  return { ok: true, contentType: detectedType };
}
