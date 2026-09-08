import { describe, expect, it } from "vitest";
import { sanitizeReturnTo } from "./return-to";

describe("sanitizeReturnTo", () => {
  it("allows invite paths", () => {
    expect(
      sanitizeReturnTo(
        "/invite/abcdefghijklmnopqrstuvwxyz0123456789-_",
      ),
    ).toBe("/invite/abcdefghijklmnopqrstuvwxyz0123456789-_");
  });

  it("allows app trip paths", () => {
    expect(sanitizeReturnTo("/app/trips/507f1f77bcf86cd799439011")).toBe(
      "/app/trips/507f1f77bcf86cd799439011",
    );
    expect(
      sanitizeReturnTo("/app/trips/507f1f77bcf86cd799439011/members"),
    ).toBe("/app/trips/507f1f77bcf86cd799439011/members");
  });

  it("rejects external and protocol-relative URLs", () => {
    expect(sanitizeReturnTo("https://evil.com")).toBeNull();
    expect(sanitizeReturnTo("//evil.com")).toBeNull();
    expect(sanitizeReturnTo("http://evil.com")).toBeNull();
  });

  it("rejects backslash and malformed paths", () => {
    expect(sanitizeReturnTo("/invite\\token")).toBeNull();
    expect(sanitizeReturnTo("/app")).toBeNull();
    expect(sanitizeReturnTo("/login")).toBeNull();
  });

  it("rejects double-encoded bypass attempts", () => {
    expect(sanitizeReturnTo("/invite/%2F%2Fevil.com")).toBeNull();
  });
});
