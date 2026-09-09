import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { getPhraseFromDefaultPack } from "@/features/language/builtin/registry";
import { PHRASEBOOK_MESSAGES, PHRASEBOOK_PAGE_TITLE } from "@/features/language/constants";
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
  const trip = await requireTripMember(tripId);
  const phrase = getPhraseFromDefaultPack(phraseId);

  if (!phrase) {
    return { title: `${PHRASEBOOK_MESSAGES.notFound} · ${trip.name}` };
  }

  return { title: `${phrase.sourceText} · ${PHRASEBOOK_PAGE_TITLE}` };
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
