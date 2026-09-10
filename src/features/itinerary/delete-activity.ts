import "server-only";

import { deleteLinkedTripExpenseForSource } from "@/features/finance/finance-linked-expense-domain";
import { connectDb } from "@/lib/db/connect";
import { withTransaction } from "@/lib/db/transaction";
import { Activity } from "@/models/Activity";
import { ActivityNotFoundError } from "./errors";
import type { DeleteActivityInput } from "./schemas";

export async function deleteActivity(input: DeleteActivityInput): Promise<string> {
  return withTransaction(async (session) => {
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
  });
}
