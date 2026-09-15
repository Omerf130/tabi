import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { listAccommodationsForTripSettings } from "@/features/accommodations/queries";
import { prepareEntityCostFormContext } from "@/features/finance/linked-expense-queries";
import { TripAccommodationSettings } from "@/features/accommodations/TripAccommodationSettings";
import { TripDocumentSettings } from "@/features/documents/TripDocumentSettings";
import {
  listAccommodationLinkOptions,
  listActivityLinkOptions,
  listTransportLinkOptions,
  listTravelDocumentsForTrip,
} from "@/features/documents/queries";
import { requireUser } from "@/features/auth/session";
import { listTransportCardsForTrip } from "@/features/transport/queries";
import { TransportPageContent } from "@/features/transport/TransportPageContent";
import { requireTripMember } from "@/features/trips/authorization";
import { listRemindersForUserTrip } from "@/features/trips/reminders/queries";
import { TripReminderSettings } from "@/features/trips/reminders/TripReminderSettings";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import {
  isOwnerOnlyManagementSection,
  parseTripManagementSection,
} from "@/features/trip-management/constants";
import { getTripManagementSectionLabel } from "@/features/trip-management/trip-management-labels";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string; section: string }>;
}): Promise<Metadata> {
  const { tripId, section: sectionParam } = await params;
  const [trip, tTripManagement] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("TripManagement"),
  ]);
  const section = parseTripManagementSection(sectionParam);
  const label = section
    ? getTripManagementSectionLabel(section, tTripManagement)
    : tTripManagement("title");
  return { title: `${label} · ${trip.name}` };
}

export default async function TripManageSectionPage({
  params,
}: {
  params: Promise<{ tripId: string; section: string }>;
}) {
  const { tripId, section: sectionParam } = await params;
  const section = parseTripManagementSection(sectionParam);
  if (!section) {
    notFound();
  }

  const [trip, user] = await Promise.all([
    requireTripMember(tripId),
    requireUser(),
  ]);

  if (isOwnerOnlyManagementSection(section) && trip.role !== "owner") {
    notFound();
  }

  const todayJapan = getJapanCalendarDate();

  switch (section) {
    case "accommodations": {
      const [accommodations, financeContext] = await Promise.all([
        listAccommodationsForTripSettings(trip.id),
        prepareEntityCostFormContext(trip.id),
      ]);
      return (
        <TripAccommodationSettings
          tripId={trip.id}
          startDate={trip.startDate}
          endDate={trip.endDate}
          accommodations={accommodations}
          variant="workspace"
          financeBaseCurrency={financeContext.baseCurrency}
          currencies={financeContext.currencies}
        />
      );
    }

    case "transport": {
      const groupedTransports = await listTransportCardsForTrip(trip.id);
      return (
        <TransportPageContent
          tripId={trip.id}
          groupedTransports={groupedTransports}
          isOwner={trip.role === "owner"}
          embedded
        />
      );
    }

    case "documents": {
      const [documents, activityOptions, accommodationOptions, transportOptions] =
        await Promise.all([
          listTravelDocumentsForTrip(trip.id),
          listActivityLinkOptions(trip.id),
          listAccommodationLinkOptions(trip.id),
          listTransportLinkOptions(trip.id),
        ]);
      return (
        <TripDocumentSettings
          tripId={trip.id}
          documents={documents}
          activityOptions={activityOptions}
          accommodationOptions={accommodationOptions}
          transportOptions={transportOptions}
          variant="workspace"
        />
      );
    }

    case "reminders": {
      const reminders = await listRemindersForUserTrip(trip.id, user.id, todayJapan);
      return (
        <TripReminderSettings
          tripId={trip.id}
          startDate={trip.startDate}
          endDate={trip.endDate}
          reminders={reminders}
          variant="workspace"
        />
      );
    }

    default:
      notFound();
  }
}
