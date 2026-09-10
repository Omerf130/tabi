import "server-only";

import { connectDb } from "@/lib/db/connect";
import { User, type UserDocument } from "@/models/User";
import { isDuplicateKeyError } from "../errors";
import { normalizeEmail } from "../schemas";
import { resolveGoogleUserName } from "./derive-google-name";
import {
  GoogleAccountConflictError,
  GoogleIdentityInvalidError,
} from "./errors";
import type { VerifiedGoogleIdentity } from "./verify-id-token";

function hasGoogleSubject(
  user: Pick<UserDocument, "googleSubject">,
): user is UserDocument & { googleSubject: string } {
  return typeof user.googleSubject === "string" && user.googleSubject.length > 0;
}

export async function resolveGoogleUser(
  identity: VerifiedGoogleIdentity,
): Promise<UserDocument> {
  const email = normalizeEmail(identity.email);
  const sub = identity.sub.trim();

  if (!email || !sub) {
    throw new GoogleIdentityInvalidError();
  }

  await connectDb();

  const bySubject = await User.findOne({ googleSubject: sub });
  if (bySubject) {
    return bySubject;
  }

  const byEmail = await User.findOne({ email });
  if (byEmail) {
    if (hasGoogleSubject(byEmail)) {
      if (byEmail.googleSubject !== sub) {
        throw new GoogleAccountConflictError();
      }
      return byEmail;
    }

    const linked = await User.findOneAndUpdate(
      {
        _id: byEmail._id,
        googleSubject: { $exists: false },
      },
      { $set: { googleSubject: sub } },
      { new: true },
    );

    if (linked) {
      return linked;
    }

    const refreshed = await User.findById(byEmail._id);
    if (!refreshed) {
      throw new GoogleIdentityInvalidError();
    }
    if (hasGoogleSubject(refreshed)) {
      if (refreshed.googleSubject !== sub) {
        throw new GoogleAccountConflictError();
      }
      return refreshed;
    }

    throw new GoogleIdentityInvalidError();
  }

  try {
    return await User.create({
      name: resolveGoogleUserName(identity.name, email),
      email,
      googleSubject: sub,
      role: "user",
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }

    const racedUser =
      (await User.findOne({ googleSubject: sub })) ??
      (await User.findOne({ email }));
    if (!racedUser) {
      throw error;
    }

    if (hasGoogleSubject(racedUser) && racedUser.googleSubject !== sub) {
      throw new GoogleAccountConflictError();
    }

    if (!hasGoogleSubject(racedUser)) {
      const linked = await User.findOneAndUpdate(
        {
          _id: racedUser._id,
          googleSubject: { $exists: false },
        },
        { $set: { googleSubject: sub } },
        { new: true },
      );
      if (linked) {
        return linked;
      }
    }

    if (hasGoogleSubject(racedUser) && racedUser.googleSubject !== sub) {
      throw new GoogleAccountConflictError();
    }

    return racedUser;
  }
}
