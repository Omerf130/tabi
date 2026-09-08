import "server-only";

import argon2 from "argon2";

export const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,p=1,t=2$1Z2ooxf0spf1eDkVLiVn0Q$S03Yn1WYcABiizUE24UjhuUsnPszt2BV4OkowTmam78";

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export async function verifyPasswordForLogin(
  passwordHash: string | null,
  password: string,
): Promise<boolean> {
  const hash = passwordHash ?? DUMMY_PASSWORD_HASH;
  const matches = await verifyPassword(hash, password);
  return Boolean(passwordHash) && matches;
}
