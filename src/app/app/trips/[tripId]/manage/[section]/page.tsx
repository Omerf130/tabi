import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAccommodationsForTripSettings } from "@/features/accommodations/queries";
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
import { TripCoverSettings } from "@/features/trips/cover/TripCoverSettings";
import { listTripInvitations } from "@/features/trips/invitations/queries";
import { listTripMembers } from "@/features/trips/members/queries";
import { listRemindersForUserTrip } from "@/features/trips/reminders/queries";
import { TripReminderSettings } from "@/features/trips/reminders/TripReminderSettings";
import { TripDetailsSection } from "@/features/trips/settings/TripDetailsSection";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import {
  isOwnerOnlyManagementSection,
  parseTripManagementSection,
  TRIP_MANAGEMENT_SECTIONS,
} from "@/features/trip-management/constants";
import { TripMembersManagementClient } from "@/features/trip-management/TripMembersManagement.client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string; section: string }>;
}): Promise<Metadata> {
  const { tripId, section: sectionParam } = await params;
  const trip = await requireTripMember(tripId);
  const section = parseTripManagementSection(sectionParam);
  const label =
    TRIP_MANAGEMENT_SECTIONS.find((item) => item.id === section)?.label ??
    "ניהול הטיול";
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
    case "details":
      return (
        <>
          <TripDetailsSection trip={trip} variant="workspace" />
          <TripCoverSettings
            tripId={trip.id}
            hasCover={Boolean(trip.coverImage)}
            isOwner={trip.role === "owner"}
            variant="workspace"
          />
        </>
      );

    case "accommodations": {
      const accommodations = await listAccommodationsForTripSettings(trip.id);
      return (
        <TripAccommodationSettings
          tripId={trip.id}
          startDate={trip.startDate}
          endDate={trip.endDate}
          accommodations={accommodations}
          variant="workspace"
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

    case "members": {
      const [members, invitations] = await Promise.all([
        listTripMembers(tripId),
        trip.role === "owner" ? listTripInvitations(tripId) : Promise.resolve([]),
      ]);
      return (
        <TripMembersManagementClient
          tripId={tripId}
          members={members}
          invitations={invitations}
          isOwnerView={trip.role === "owner"}
          currentUserId={user.id}
        />
      );
    }

    default:
      notFound();
  }
}
