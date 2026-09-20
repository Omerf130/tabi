import { deliverDueReminderNotifications } from "@/features/push/delivery/deliver-due-reminder-notifications";
import { VapidConfigurationError } from "@/features/push/delivery/vapid-server-config";

/**
 * Manual N3 entry (development only). Production uses /api/internal/reminder-notifications.
 * Optional header: x-push-delivery-dev-secret when PUSH_DELIVERY_DEV_SECRET is set.
 */
export async function POST(request: Request): Promise<Response> {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  const configuredSecret = process.env.PUSH_DELIVERY_DEV_SECRET?.trim();
  if (configuredSecret) {
    const provided = request.headers.get("x-push-delivery-dev-secret")?.trim();
    if (provided !== configuredSecret) {
      return new Response(null, { status: 401 });
    }
  }

  try {
    const summary = await deliverDueReminderNotifications();
    return Response.json(summary);
  } catch (error) {
    if (error instanceof VapidConfigurationError) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}
