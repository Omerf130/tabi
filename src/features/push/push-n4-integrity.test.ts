import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Push N4 integrity", () => {
  it("uses POST scheduler route with node runtime and Bearer secret", () => {
    const routeSource = readFileSync(
      join(root, "src/app/api/internal/reminder-notifications/route.ts"),
      "utf8",
    );
    expect(routeSource).toContain('export const runtime = "nodejs"');
    expect(routeSource).toContain("deliverDueReminderNotifications");
    expect(routeSource).toContain("isPushSchedulerAuthorized");
    expect(routeSource).not.toContain("batchSize");
    expect(routeSource).not.toContain("searchParams");
  });

  it("does not introduce Vercel Cron configuration", () => {
    let vercelJson = "";
    try {
      vercelJson = readFileSync(join(root, "vercel.json"), "utf8");
    } catch {
      vercelJson = "";
    }
    expect(vercelJson).not.toMatch(/"crons"/);

    const routeSource = readFileSync(
      join(root, "src/app/api/internal/reminder-notifications/route.ts"),
      "utf8",
    );
    expect(routeSource).not.toContain("CRON_SECRET");
  });

  it("keeps dev delivery route production-disabled", () => {
    const devRoute = readFileSync(
      join(root, "src/app/api/dev/push-deliver-due/route.ts"),
      "utf8",
    );
    expect(devRoute).toContain('process.env.NODE_ENV === "production"');
  });
});
