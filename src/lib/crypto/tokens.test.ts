import { describe, expect, it } from "vitest";
import {
  generateSecureToken,
  hashToken,
} from "@/lib/crypto/tokens";

describe("secure tokens", () => {
  it("generates base64url tokens with high entropy shape", () => {
    const token = generateSecureToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(43);
  });

  it("hashes deterministically and never equals the raw token", () => {
    const token = generateSecureToken();
    const hash = hashToken(token);
    expect(hash).toHaveLength(64);
    expect(hash).toBe(hashToken(token));
    expect(hash).not.toBe(token);
  });
});
