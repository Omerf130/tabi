import "server-only";

import { getTranslations } from "next-intl/server";
import { resolveRequestLocale } from "@/features/i18n/resolve-request-locale";
import { getTripWithMembership } from "@/features/trips/queries";
import {
  buildLanguagePageViewModel,
  buildPhraseDetailViewModelForTrip,
} from "./prepare-phrasebook-runtime";
import type { LanguagePageViewModel, PhraseDetailViewModel } from "./types";

export async function prepareLanguagePage(
  tripId: string,
  userId: string,
): Promise<LanguagePageViewModel | null> {
  const membership = await getTripWithMembership(userId, tripId);
  if (!membership) {
    return null;
  }

  const uiLocale = await resolveRequestLocale();
  const t = await getTranslations("Language");

  return buildLanguagePageViewModel({
    trip: membership.trip,
    userId,
    uiLocale,
    t,
  });
}

export async function getPhraseDetailForTrip(
  tripId: string,
  userId: string,
  phraseId: string,
): Promise<PhraseDetailViewModel | null> {
  const membership = await getTripWithMembership(userId, tripId);
  if (!membership) {
    return null;
  }

  const t = await getTranslations("Language");
  return buildPhraseDetailViewModelForTrip({
    trip: membership.trip,
    userId,
    phraseId,
    t,
  });
}
