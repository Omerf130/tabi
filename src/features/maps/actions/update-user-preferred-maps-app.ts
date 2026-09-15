"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/features/auth/session";
import { connectDb } from "@/lib/db/connect";
import { MAPS_APPS } from "@/lib/maps/maps-app";
import { User } from "@/models/User";

const updateUserPreferredMapsAppSchema = z.object({
  preferredMapsApp: z.enum(MAPS_APPS),
});

export type UpdateUserPreferredMapsAppState = {
  errorCode?: "invalid_preferred_maps_app" | "unauthorized";
};

export async function updateUserPreferredMapsAppAction(
  _prev: UpdateUserPreferredMapsAppState,
  formData: FormData,
): Promise<UpdateUserPreferredMapsAppState> {
  const user = await requireUser();
  const raw = formData.get("preferredMapsApp");
  const parsed = updateUserPreferredMapsAppSchema.safeParse({
    preferredMapsApp: raw,
  });

  if (!parsed.success) {
    return { errorCode: "invalid_preferred_maps_app" };
  }

  await connectDb();
  await User.updateOne(
    { _id: user.id },
    { $set: { preferredMapsApp: parsed.data.preferredMapsApp } },
  );
  revalidatePath("/", "layout");

  return {};
}
