import { deliverDueReminderNotifications } from "@/features/push/delivery/deliver-due-reminder-notifications";
import { isPushSchedulerAuthorized } from "@/features/push/delivery/verify-push-scheduler-authorization";

export const runtime = "nodejs";

function unauthorizedResponse(): Response {
  return new Response(null, { status: 401 });
}

function logSchedulerRun(input: {
  durationMs: number;
  discovered: number;
  claimed: number;
  sent: number;
  skipped: number;
  failed: number;
  expiredSubscriptionsRemoved: number;
}): void {
  console.log(
    JSON.stringify({
      event: "push_scheduler_delivery",
      durationMs: input.durationMs,
      discovered: input.discovered,
      claimed: input.claimed,
      sent: input.sent,
      skipped: input.skipped,
      failed: input.failed,
      expiredSubscriptionsRemoved: input.expiredSubscriptionsRemoved,
    }),
  );
}

export async function POST(request: Request): Promise<Response> {
  if (!isPushSchedulerAuthorized(request.headers.get("authorization"))) {
    return unauthorizedResponse();
  }

  const startedAt = Date.now();

  try {
    const summary = await deliverDueReminderNotifications();
    const durationMs = Date.now() - startedAt;
    logSchedulerRun({ durationMs, ...summary });

    return Response.json({
      ok: true,
      ...summary,
    });
  } catch {
    const durationMs = Date.now() - startedAt;
    console.error(
      JSON.stringify({
        event: "push_scheduler_delivery_failed",
        durationMs,
      }),
    );
    return Response.json({ ok: false }, { status: 500 });
  }
}

export async function GET(): Promise<Response> {
  return new Response(null, { status: 405 });
}
