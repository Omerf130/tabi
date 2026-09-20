import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("dev push deliver-due route", () => {
  it("is disabled in production", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/api/dev/push-deliver-due/route.ts"),
      "utf8",
    );
    expect(source).toContain('process.env.NODE_ENV === "production"');
    expect(source).toContain("404");
  });
});
