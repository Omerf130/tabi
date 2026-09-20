import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Push N3 integrity", () => {
  it("uses web-push only from server-only delivery modules", () => {
    const senderSource = readFileSync(
      join(root, "src/features/push/delivery/web-push-sender.ts"),
      "utf8",
    );
    expect(senderSource).toContain('"server-only"');
    expect(senderSource).toContain("web-push");

    const swSource = readFileSync(join(root, "src/app/sw.ts"), "utf8");
    expect(swSource).not.toContain("web-push");
  });

  it("exposes manual delivery only on a dev-only API route", () => {
    const routeSource = readFileSync(
      join(root, "src/app/api/dev/push-deliver-due/route.ts"),
      "utf8",
    );
    expect(routeSource).toContain('process.env.NODE_ENV === "production"');
    expect(routeSource).toContain("deliverDueReminderNotifications");
  });

  it("does not add Cron or vercel.json scheduler", () => {
    const pkg = JSON.parse(
      readFileSync(join(root, "package.json"), "utf8"),
    ) as { dependencies?: Record<string, string> };
    expect(pkg.dependencies?.["web-push"]).toBeDefined();

    let vercelJson = "";
    try {
      vercelJson = readFileSync(join(root, "vercel.json"), "utf8");
    } catch {
      vercelJson = "";
    }
    expect(vercelJson).not.toMatch(/"crons"/);
  });

  it("extends TripReminder with delivery fields", () => {
    const modelSource = readFileSync(
      join(root, "src/models/TripReminder.ts"),
      "utf8",
    );
    expect(modelSource).toContain("notificationClaimedAt");
    expect(modelSource).toContain("notificationSentAt");
  });
});
