"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { validateTripCoverUpload } from "@/features/trips/cover/validate-trip-cover";
import {
  cleanupProfileImagePathname,
  clearUserProfileImage,
  replaceUserProfileImage,
} from "@/features/account/profile-image/profile-image-domain";

export type ProfileImageActionState = {
  ok?: boolean;
  errorCode?: "missingFile" | "tooLarge" | "invalidType" | "generic";
};

export async function uploadUserProfileImageAction(
  _prev: ProfileImageActionState,
  formData: FormData,
): Promise<ProfileImageActionState> {
  const user = await requireUser();
  const file = formData.get("profileImage");

  if (!(file instanceof File)) {
    return { errorCode: "missingFile" };
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const validation = validateTripCoverUpload({
      size: file.size,
      bytes,
      declaredType: file.type,
    });

    if (!validation.ok) {
      if (validation.error === "tooLarge") {
        return { errorCode: "tooLarge" };
      }
      if (validation.error === "missing") {
        return { errorCode: "missingFile" };
      }
      return { errorCode: "invalidType" };
    }

    const { previousPathname } = await replaceUserProfileImage(
      user.id,
      Buffer.from(bytes),
      validation.contentType,
    );

    if (previousPathname) {
      await cleanupProfileImagePathname(previousPathname);
    }

    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { errorCode: "generic" };
  }
}

export async function removeUserProfileImageAction(
  _prev: ProfileImageActionState,
  _formData: FormData,
): Promise<ProfileImageActionState> {
  void _prev;
  void _formData;
  const user = await requireUser();

  try {
    const previousPathname = await clearUserProfileImage(user.id);
    if (previousPathname) {
      await cleanupProfileImagePathname(previousPathname);
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { errorCode: "generic" };
  }
}

