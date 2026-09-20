/** Finite claim lease — stale claims become reclaimable (worker crash recovery). */
export const REMINDER_NOTIFICATION_CLAIM_LEASE_MS = 5 * 60 * 1000;

/** Conservative batch size for due-reminder discovery (N4 Cron will reuse). */
export const REMINDER_NOTIFICATION_DELIVERY_BATCH_SIZE = 50;
