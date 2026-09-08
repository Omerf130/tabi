import { describe, expect, it } from "vitest";
import { resolveRequestOrigin } from "./request-origin";

describe("resolveRequestOrigin", () => {
  it("prefers forwarded host and proto from the active request", () => {
    expect(
      resolveRequestOrigin({
        host: "localhost:3001",
        forwardedHost: "tabi.example.com",
        forwardedProto: "https",
      }),
    ).toBe("https://tabi.example.com");
  });

  it("uses request host when forwarded host is absent", () => {
    expect(
      resolveRequestOrigin({
        host: "localhost:3001",
        forwardedHost: null,
        forwardedProto: null,
      }),
    ).toBe("http://localhost:3001");
  });

  it("falls back to configured origin without a host header", () => {
    expect(
      resolveRequestOrigin({
        host: null,
        forwardedHost: null,
        forwardedProto: null,
        configuredOrigin: "https://tabi.example.com/",
      }),
    ).toBe("https://tabi.example.com");
  });

  it("does not hardcode localhost:3000 when the dev server exposes its port", () => {
    expect(
      resolveRequestOrigin({
        host: "localhost:3001",
        forwardedHost: null,
        forwardedProto: null,
      }),
    ).not.toBe("http://localhost:3000");
  });
});
