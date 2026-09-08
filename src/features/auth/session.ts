import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db/connect";
import { Session } from "@/models/Session";
import { User } from "@/models/User";
import { SESSION_MAX_AGE_SECONDS } from "./constants";
import {
  clearSessionCookie,
  getSessionCookie,
  setSessionCookie,
} from "./cookies";
import { toPublicUser, type PublicUser } from "./public-user";
import { isSessionExpired } from "./session-expiry";
import { generateSessionToken, hashSessionToken } from "./token";

export async function createSession(userId: string): Promise<void> {
  await connectDb();
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await Session.create({ userId, tokenHash, expiresAt });
  await setSessionCookie(token);
}

export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const token = await getSessionCookie();
  if (!token) {
    return null;
  }

  await connectDb();
  const tokenHash = hashSessionToken(token);
  const session = await Session.findOne({ tokenHash }).lean();
  if (!session || isSessionExpired(session.expiresAt)) {
    return null;
  }

  const user = await User.findById(session.userId).lean();
  if (!user) {
    return null;
  }

  return toPublicUser(user);
});

export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function deleteCurrentSession(): Promise<void> {
  const token = await getSessionCookie();
  if (token) {
    await connectDb();
    await Session.deleteOne({ tokenHash: hashSessionToken(token) });
  }
  await clearSessionCookie();
}
