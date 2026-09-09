"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { requireTripMember } from "@/features/trips/authorization";
import { buildLanguageHref, buildLanguagePhraseHref, PHRASEBOOK_MESSAGES } from "./constants";
import {
  PhraseFavoriteValidationError,
  togglePhraseFavorite,
} from "./phrase-favorite-domain";
import { togglePhraseFavoriteSchema } from "./schemas";

export type PhraseFavoriteActionState = {
  ok?: boolean;
  isFavorite?: boolean;
  phraseId?: string;
  error?: string;
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
    packId: formData.get("packId"),
  });

  if (!parsed.success) {
    return { error: PHRASEBOOK_MESSAGES.favoriteFailed };
  }

  try {
    const user = await requireUser();
    const trip = await requireTripMember(parsed.data.tripId);
    const result = await togglePhraseFavorite({
      userId: user.id,
      packId: parsed.data.packId,
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
      return { error: error.message };
    }
    return { error: PHRASEBOOK_MESSAGES.favoriteFailed };
  }
}
