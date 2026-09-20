import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { getPhraseIntentById } from "@/features/language/phrase-intent-catalog";
import { getPhraseIntentUiSourceText } from "@/features/language/phrase-intent-i18n";
import { PhraseDetailContent } from "@/features/language/PhraseDetailContent";
import { getPhraseDetailForTrip } from "@/features/language/queries";
import { requireTripMember } from "@/features/trips/authorization";
import { requireUser } from "@/features/auth/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string; phraseId: string }>;
}): Promise<Metadata> {
  const { tripId, phraseId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Language"),
  ]);
  const intent = getPhraseIntentById(phraseId);

  if (!intent) {
    return { title: `${t("errors.notFound")} · ${trip.name}` };
  }

  const sourceText = getPhraseIntentUiSourceText(phraseId, t);
  return { title: `${sourceText} · ${t("pageTitle")}` };
}

export default async function LanguagePhrasePage({
  params,
}: {
  params: Promise<{ tripId: string; phraseId: string }>;
}) {
  const { tripId, phraseId } = await params;
  const [trip, user] = await Promise.all([requireTripMember(tripId), requireUser()]);
  const phrase = await getPhraseDetailForTrip(trip.id, user.id, phraseId);

  if (!phrase) {
    notFound();
  }

  return (
    <>
      <TripHeader
        title={phrase.sourceText}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/language`}
      />
      <PhraseDetailContent tripId={trip.id} phrase={phrase} />
    </>
  );
}
