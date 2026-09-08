import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword, verifyPasswordForLogin } from "./password";

describe("password hashing", () => {
  it("hashes and verifies Argon2id", async () => {
    const password = "correct-horse-battery";
    const hash = await hashPassword(password);
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toBe(password);
    expect(await verifyPassword(hash, password)).toBe(true);
    expect(await verifyPassword(hash, "wrong-password")).toBe(false);
  });

  it("does not treat a missing user hash as a match", async () => {
    const ok = await verifyPasswordForLogin(null, "correct-horse-battery");
    expect(ok).toBe(false);
  });
});
