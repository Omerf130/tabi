import { describe, expect, it } from "vitest";
import { AUTH_MESSAGES, duplicateEmailMessage, isDuplicateKeyError } from "./errors";
import { loginSchema, normalizeEmail, registerSchema } from "./schemas";
import { registrationUserFields, toPublicUser } from "./public-user";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Alex@Example.COM ")).toBe("alex@example.com");
  });
});

describe("registerSchema", () => {
  it("normalizes email", () => {
    const result = registerSchema.safeParse({
      name: "אלכס",
      email: "  A@B.COM ",
      password: "long-enough",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("a@b.com");
    }
  });

  it("rejects a platform role field", () => {
    const result = registerSchema.safeParse({
      name: "אלכס",
      email: "a@b.com",
      password: "long-enough",
      role: "admin",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short passwords", () => {
    const result = registerSchema.safeParse({
      name: "אלכס",
      email: "a@b.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("does not accept a role field", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "long-enough",
      role: "admin",
    });
    expect(result.success).toBe(false);
  });
});

describe("registrationUserFields", () => {
  it("always assigns role user", () => {
    const fields = registrationUserFields({
      name: "אלכס",
      email: "a@b.com",
      passwordHash: "hash",
    });
    expect(fields.role).toBe("user");
    expect(fields).not.toHaveProperty("admin");
  });
});

describe("toPublicUser", () => {
  it("never exposes passwordHash", () => {
    const publicUser = toPublicUser({
      _id: { toString: () => "abc" },
      name: "אלכס",
      email: "a@b.com",
      role: "user",
      passwordHash: "secret-hash",
    });
    expect(publicUser).toEqual({
      id: "abc",
      name: "אלכס",
      email: "a@b.com",
      role: "user",
    });
    expect(publicUser).not.toHaveProperty("passwordHash");
  });
});

describe("duplicate Mongo mapping", () => {
  it("maps code 11000 to the friendly Hebrew message", () => {
    expect(isDuplicateKeyError({ code: 11000 })).toBe(true);
    expect(duplicateEmailMessage()).toBe(AUTH_MESSAGES.duplicateEmail);
  });

  it("does not treat other errors as duplicates", () => {
    expect(isDuplicateKeyError(new Error("fail"))).toBe(false);
  });
});
