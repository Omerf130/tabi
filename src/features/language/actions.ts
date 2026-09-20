"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { requireTripMember } from "@/features/trips/authorization";
import {
  buildLanguageHref,
  buildLanguagePhraseHref,
  PHRASEBOOK_ERROR_CODES,
  type PhrasebookErrorCode,
} from "./constants";
import {
  PhraseFavoriteValidationError,
  togglePhraseFavorite,
} from "./phrase-favorite-domain";
import { togglePhraseFavoriteSchema } from "./schemas";

export type PhraseFavoriteActionState = {
  ok?: boolean;
  isFavorite?: boolean;
  phraseId?: string;
  errorCode?: PhrasebookErrorCode;
};

function revalidateLanguagePaths(tripId: string, phraseId?: string): void {
  revalidatePath(buildLanguageHref(tripId));
  revalidatePath(`/app/trips/${tripId}/more`);
  if (phraseId) {
    revalidatePath(buildLanguagePhraseHref(tripId, phraseId));
  }
}

export async function togglePhraseFavoriteAction(
  _prev: PhraseFavoriteActionState,
  formData: FormData,
): Promise<PhraseFavoriteActionState> {
  const parsed = togglePhraseFavoriteSchema.safeParse({
    tripId: formData.get("tripId"),
    phraseId: formData.get("phraseId"),
  });

  if (!parsed.success) {
    return { errorCode: PHRASEBOOK_ERROR_CODES.favoriteFailed };
  }

  try {
    const user = await requireUser();
    const trip = await requireTripMember(parsed.data.tripId);
    const targetLanguage = trip.effectiveTravelLanguageCode;
    if (!targetLanguage) {
      return { errorCode: PHRASEBOOK_ERROR_CODES.favoriteFailed };
    }

    const result = await togglePhraseFavorite({
      userId: user.id,
      targetLanguage,
      phraseId: parsed.data.phraseId,
    });
    revalidateLanguagePaths(trip.id, parsed.data.phraseId);
    return {
      ok: true,
      isFavorite: result.isFavorite,
      phraseId: parsed.data.phraseId,
    };
  } catch (error) {
    if (error instanceof PhraseFavoriteValidationError) {
      return { errorCode: error.code };
    }
    return { errorCode: PHRASEBOOK_ERROR_CODES.favoriteFailed };
  }
}
