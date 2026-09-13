"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDb } from "@/lib/db/connect";
import { User } from "@/models/User";
import { requireUser } from "@/features/auth/session";
import { setLocaleCookie } from "@/features/i18n/locale-cookie";
import { APP_LOCALES, parseAppLocale } from "@/features/i18n/locale";

const updateUserLocaleSchema = z.object({
  locale: z.enum(APP_LOCALES),
});

export type UpdateUserLocaleState = {
  errorCode?: "invalid_locale" | "unauthorized";
};

export async function updateUserLocaleAction(
  _prev: UpdateUserLocaleState,
  formData: FormData,
): Promise<UpdateUserLocaleState> {
  const user = await requireUser();
  const rawLocale = formData.get("locale");
  const parsed = updateUserLocaleSchema.safeParse({ locale: rawLocale });

  if (!parsed.success) {
    return { errorCode: "invalid_locale" };
  }

  const locale = parseAppLocale(parsed.data.locale);
  if (!locale) {
    return { errorCode: "invalid_locale" };
  }

  await connectDb();
  await User.updateOne({ _id: user.id }, { $set: { locale } });
  await setLocaleCookie(locale);
  revalidatePath("/", "layout");

  return {};
}
