import type { PushNotificationWirePayload } from "../push-notification-constants";
import { PUSH_NOTIFICATION_DEFAULT_TITLE } from "../push-notification-constants";

export function buildTripReminderPushWirePayload(input: {
  tripId: string;
  reminderId: string;
  body: string;
}): PushNotificationWirePayload {
  return {
    title: PUSH_NOTIFICATION_DEFAULT_TITLE,
    body: input.body,
    url: `/app/trips/${input.tripId}`,
    tag: `reminder-${input.reminderId}`,
  };
}
