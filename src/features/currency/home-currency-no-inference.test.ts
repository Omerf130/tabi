import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { toPublicUser } from "@/features/auth/public-user";

describe("homeCurrency must not be inferred", () => {
  it("defaults to null in public user when unset", () => {
    const user = toPublicUser({
      _id: { toString: () => "u1" },
      name: "Test",
      email: "t@example.com",
      role: "user",
      locale: "he",
    });
    expect(user.homeCurrency).toBeNull();
  });

  it("update domain does not reference locale or destination", () => {
    const source = readFileSync(
      join(process.cwd(), "src/features/currency/update-user-home-currency.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/locale|destination|timezone|geolocation|country|IP/i);
  });

  it("converter page passes explicit user homeCurrency only", () => {
    const source = readFileSync(
      join(process.cwd(), "src/features/currency/queries.ts"),
      "utf8",
    );
    expect(source).toContain("homeCurrency: user?.homeCurrency ?? null");
    expect(source).not.toMatch(/destination|timezone|geolocation|countryCode/i);
  });
});
