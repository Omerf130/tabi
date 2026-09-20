import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("logout push cleanup wiring", () => {
  it("uses best-effort push cleanup before logoutAction", () => {
    const source = readFileSync(
      join(process.cwd(), "src/features/push/LogoutWithPushCleanup.client.tsx"),
      "utf8",
    );
    expect(source).toContain("bestEffortDisablePushOnLogout");
    expect(source).toContain("logoutAction");
  });

  it("swallows push cleanup failures in bestEffortDisablePushOnLogout", () => {
    const source = readFileSync(
      join(process.cwd(), "src/features/push/push-device-sync.client.ts"),
      "utf8",
    );
    expect(source).toMatch(/catch\s*\{[\s\S]*Logout must proceed/);
  });
});
