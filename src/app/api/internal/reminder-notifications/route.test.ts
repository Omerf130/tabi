import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { deliverMock } = vi.hoisted(() => ({
  deliverMock: vi.fn(),
}));

vi.mock("@/features/push/delivery/deliver-due-reminder-notifications", () => ({
  deliverDueReminderNotifications: deliverMock,
}));

import { GET, POST } from "./route";

describe("POST /api/internal/reminder-notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PUSH_SCHEDULER_SECRET = "scheduler-secret";
    deliverMock.mockResolvedValue({
      discovered: 3,
      claimed: 2,
      sent: 2,
      skipped: 1,
      failed: 0,
      expiredSubscriptionsRemoved: 0,
    });
  });

  afterEach(() => {
    delete process.env.PUSH_SCHEDULER_SECRET;
  });

  it("does not invoke delivery without Authorization", async () => {
    const response = await POST(new Request("http://localhost/api/internal/reminder-notifications", { method: "POST" }));

    expect(response.status).toBe(401);
    expect(deliverMock).not.toHaveBeenCalled();
  });

  it("does not invoke delivery with wrong secret", async () => {
    const response = await POST(
      new Request("http://localhost/api/internal/reminder-notifications", {
        method: "POST",
        headers: { Authorization: "Bearer wrong" },
      }),
    );

    expect(response.status).toBe(401);
    expect(deliverMock).not.toHaveBeenCalled();
  });

  it("fails closed when PUSH_SCHEDULER_SECRET is missing", async () => {
    delete process.env.PUSH_SCHEDULER_SECRET;

    const response = await POST(
      new Request("http://localhost/api/internal/reminder-notifications", {
        method: "POST",
        headers: { Authorization: "Bearer scheduler-secret" },
      }),
    );

    expect(response.status).toBe(401);
    expect(deliverMock).not.toHaveBeenCalled();
  });

  it("invokes N3 orchestrator with correct secret", async () => {
    const response = await POST(
      new Request("http://localhost/api/internal/reminder-notifications", {
        method: "POST",
        headers: { Authorization: "Bearer scheduler-secret" },
      }),
    );

    expect(response.status).toBe(200);
    expect(deliverMock).toHaveBeenCalledTimes(1);
    expect(deliverMock).toHaveBeenCalledWith();

    const body = (await response.json()) as Record<string, unknown>;
    expect(body).toEqual({
      ok: true,
      discovered: 3,
      claimed: 2,
      sent: 2,
      skipped: 1,
      failed: 0,
      expiredSubscriptionsRemoved: 0,
    });
    expect(JSON.stringify(body)).not.toContain("p256dh");
    expect(JSON.stringify(body)).not.toContain("scheduler-secret");
    expect(JSON.stringify(body)).not.toContain("Passport");
  });

  it("returns safe 500 when delivery throws", async () => {
    deliverMock.mockRejectedValue(new Error("boom"));

    const response = await POST(
      new Request("http://localhost/api/internal/reminder-notifications", {
        method: "POST",
        headers: { Authorization: "Bearer scheduler-secret" },
      }),
    );

    expect(response.status).toBe(500);
    const body = (await response.json()) as { ok: boolean };
    expect(body).toEqual({ ok: false });
  });

  it("does not allow GET delivery", async () => {
    const response = await GET();
    expect(response.status).toBe(405);
    expect(deliverMock).not.toHaveBeenCalled();
  });
});
