"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/features/auth/session";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
} from "@/features/auth/constants";
import { connectDb } from "@/lib/db/connect";
import { User } from "@/models/User";

const updateUserNameSchema = z.object({
  name: z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
});

export type UpdateUserNameState = {
  ok?: boolean;
  errorCode?: "invalid_name" | "unauthorized";
};

export async function updateUserNameAction(
  _prev: UpdateUserNameState,
  formData: FormData,
): Promise<UpdateUserNameState> {
  const user = await requireUser();
  const parsed = updateUserNameSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { errorCode: "invalid_name" };
  }

  await connectDb();
  await User.updateOne({ _id: user.id }, { $set: { name: parsed.data.name } });
  revalidatePath("/", "layout");

  return { ok: true };
}
