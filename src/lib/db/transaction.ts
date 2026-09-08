import "server-only";

import mongoose, { type ClientSession } from "mongoose";
import { connectDb } from "./connect";

/**
 * Runs fn in a MongoDB transaction via Mongoose connection.transaction(),
 * which delegates to the driver's session.withTransaction().
 *
 * Retry semantics (MongoDB Convenient Transaction API):
 * - TransientTransactionError (incl. write conflict / code 112): retries the
 *   full transaction; the callback may run more than once.
 * - UnknownTransactionCommitResult: retries commitTransaction only; the
 *   callback is NOT re-run (avoids false invite-invalid after a successful join).
 * - All other errors (InviteInvalidError, AlreadyMemberError, LastOwnerError,
 *   etc.): no retry; error propagates immediately.
 *
 * Retries are bounded by the driver's CSOT timeout (default 120s).
 */
export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> {
  await connectDb();
  return mongoose.connection.transaction((session) => fn(session));
}
