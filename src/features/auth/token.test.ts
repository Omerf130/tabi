import { describe, expect, it } from "vitest";
import { generateSessionToken, hashSessionToken } from "./token";

describe("session token hashing", () => {
  it("is deterministic and never equals the raw token", () => {
    const token = generateSessionToken();
    const hash = hashSessionToken(token);
    expect(hash).toHaveLength(64);
    expect(hash).toBe(hashSessionToken(token));
    expect(hash).not.toBe(token);
  });

  it("changes when the raw token changes", () => {
    expect(hashSessionToken("aaa")).not.toBe(hashSessionToken("bbb"));
  });
});
