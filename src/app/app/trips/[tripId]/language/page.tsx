import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { LanguagePageContent } from "@/features/language/LanguagePageContent";
import { prepareLanguagePage } from "@/features/language/queries";
import { requireTripMember } from "@/features/trips/authorization";
import { requireUser } from "@/features/auth/session";
import { PHRASEBOOK_CATEGORIES } from "@/features/language/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Language"),
  ]);
  return { title: `${t("pageTitle")} · ${trip.name}` };
}

function parseCategoryParam(value: string | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }
  return (PHRASEBOOK_CATEGORIES as readonly string[]).includes(value)
    ? value
    : null;
}

export default async function LanguagePage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ category?: string; favorites?: string }>;
}) {
  const { tripId } = await params;
  const { category, favorites } = await searchParams;
  const [trip, user, t] = await Promise.all([
    requireTripMember(tripId),
    requireUser(),
    getTranslations("Language"),
  ]);
  const pageData = await prepareLanguagePage(trip.id, user.id);

  return (
    <>
      <TripHeader
        title={t("pageTitle")}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      <LanguagePageContent
        {...pageData}
        initialCategory={parseCategoryParam(category)}
        showFavorites={favorites === "1"}
      />
    </>
  );
}
