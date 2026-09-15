import "server-only";

import type { ClientSession } from "mongoose";
import { clearTravelDocumentEntityLinks } from "@/features/documents/clear-travel-document-entity-links";
import { deleteLinkedTripExpenseForSource } from "@/features/finance/finance-linked-expense-domain";
import { connectDb } from "@/lib/db/connect";
import { withTransaction } from "@/lib/db/transaction";
import { Activity } from "@/models/Activity";
import { ActivityNotFoundError } from "./errors";
import type { DeleteActivityInput } from "./schemas";

export async function deleteActivityInSession(
  session: ClientSession,
  input: DeleteActivityInput,
): Promise<string> {
  await connectDb();
  const existing = await Activity.findOne({
    _id: input.activityId,
    tripId: input.tripId,
  })
    .select("date")
    .session(session)
    .lean();

  if (!existing) {
    throw new ActivityNotFoundError();
  }

  await clearTravelDocumentEntityLinks({
    tripId: input.tripId,
    activityId: input.activityId,
    session,
  });

  await deleteLinkedTripExpenseForSource(
    input.tripId,
    "activity",
    input.activityId,
    session,
  );

  const result = await Activity.deleteOne({
    _id: input.activityId,
    tripId: input.tripId,
  }).session(session);

  if (result.deletedCount !== 1) {
    throw new ActivityNotFoundError();
  }

  return existing.date;
}

export async function deleteActivity(input: DeleteActivityInput): Promise<string> {
  return withTransaction(async (session) => deleteActivityInSession(session, input));
}
