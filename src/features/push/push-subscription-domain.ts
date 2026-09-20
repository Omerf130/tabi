import "server-only";

import { connectDb } from "@/lib/db/connect";
import { PushSubscription } from "@/models/PushSubscription";
import type { pushSubscriptionInputSchema } from "./schemas";
import type { z } from "zod";

export type PushSubscriptionUpsertInput = z.infer<
  typeof pushSubscriptionInputSchema
>;

/**
 * Upserts by globally unique endpoint. The authenticated userId always wins
 * ownership (shared-browser safety when another user logs in on the same device).
 */
export async function upsertPushSubscriptionForUser(
  userId: string,
  input: PushSubscriptionUpsertInput,
): Promise<void> {
  await connectDb();
  const now = new Date();
  await PushSubscription.findOneAndUpdate(
    { endpoint: input.endpoint },
    {
      $set: {
        userId,
        endpoint: input.endpoint,
        keys: {
          p256dh: input.keys.p256dh,
          auth: input.keys.auth,
        },
        lastSeenAt: now,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

/** Deletes the subscription row when it belongs to the given user. */
export async function deletePushSubscriptionForUserEndpoint(
  userId: string,
  endpoint: string,
): Promise<boolean> {
  await connectDb();
  const deleted = await PushSubscription.deleteOne({ userId, endpoint });
  return deleted.deletedCount === 1;
}

export async function listPushSubscriptionsForUser(
  userId: string,
): Promise<PushSubscriptionUpsertInput[]> {
  await connectDb();
  const rows = await PushSubscription.find({ userId })
    .select("endpoint keys.p256dh keys.auth")
    .lean();

  return rows.map((row) => ({
    endpoint: row.endpoint,
    keys: {
      p256dh: row.keys.p256dh,
      auth: row.keys.auth,
    },
  }));
}

export async function deletePushSubscriptionByEndpoint(
  endpoint: string,
): Promise<boolean> {
  await connectDb();
  const deleted = await PushSubscription.deleteOne({ endpoint });
  return deleted.deletedCount === 1;
}
