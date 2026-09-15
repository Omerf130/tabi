"use server";

import { z } from "zod";
import { requireUser } from "@/features/auth/session";
import {
  HomeCurrencyValidationError,
  updateUserHomeCurrency,
} from "@/features/currency/update-user-home-currency";
import { revalidatePath } from "next/cache";

const homeCurrencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/);

export type UpdateUserHomeCurrencyState = {
  ok?: boolean;
  errorCode?: "invalid_currency" | "unsupported_currency" | "unauthorized";
};

export async function updateUserHomeCurrencyAction(
  _prev: UpdateUserHomeCurrencyState,
  formData: FormData,
): Promise<UpdateUserHomeCurrencyState> {
  const user = await requireUser();
  const parsed = homeCurrencyCodeSchema.safeParse(formData.get("homeCurrency"));

  if (!parsed.success) {
    return { errorCode: "invalid_currency" };
  }

  try {
    await updateUserHomeCurrency(user.id, parsed.data);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    if (error instanceof HomeCurrencyValidationError) {
      return { errorCode: error.code };
    }
    throw error;
  }
}
