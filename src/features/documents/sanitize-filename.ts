import { TRAVEL_DOCUMENT_ORIGINAL_FILENAME_MAX_LENGTH } from "./constants";

export function sanitizeOriginalFilename(filename: string): string {
  const basename = filename.split(/[/\\]/).pop() ?? filename;
  const cleaned = basename
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>:"|?*]/g, "")
    .trim();

  if (!cleaned) {
    return "document";
  }

  return cleaned.slice(0, TRAVEL_DOCUMENT_ORIGINAL_FILENAME_MAX_LENGTH);
}

export function contentDispositionFilename(filename: string): string {
  const sanitized = sanitizeOriginalFilename(filename);
  const ascii = sanitized.replace(/[^\x20-\x7E]+/g, "_").trim() || "document";
  return ascii;
}
