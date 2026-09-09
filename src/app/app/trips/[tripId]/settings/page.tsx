import type { Metadata } from "next";
import { AppPage } from "@/features/app-shell/AppPage";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { TripCoverSettings } from "@/features/trips/cover/TripCoverSettings";
import { TripAccommodationSettings } from "@/features/accommodations/TripAccommodationSettings";
import { listAccommodationsForTripSettings } from "@/features/accommodations/queries";
import { TripDocumentSettings } from "@/features/documents/TripDocumentSettings";
import {
  listAccommodationLinkOptions,
  listActivityLinkOptions,
  listTransportLinkOptions,
  listTravelDocumentsForTrip,
} from "@/features/documents/queries";
import { listRemindersForUserTrip } from "@/features/trips/reminders/queries";
import { TripReminderSettings } from "@/features/trips/reminders/TripReminderSettings";
import { TripDetailsSection } from "@/features/trips/settings/TripDetailsSection";
import sectionStyles from "@/features/trips/settings/TripSettingsSections.module.scss";
import { requireTripMember } from "@/features/trips/authorization";
import { requireUser } from "@/features/auth/session";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `הגדרות · ${trip.name}` };
}

export default async function TripSettingsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, user] = await Promise.all([
    requireTripMember(tripId),
    requireUser(),
  ]);
  const todayJapan = getJapanCalendarDate();
  const [reminders, accommodations, documents, activityOptions, accommodationOptions, transportOptions] =
    await Promise.all([
    listRemindersForUserTrip(trip.id, user.id, todayJapan),
    listAccommodationsForTripSettings(trip.id),
    trip.role === "owner" ? listTravelDocumentsForTrip(trip.id) : Promise.resolve([]),
    trip.role === "owner" ? listActivityLinkOptions(trip.id) : Promise.resolve([]),
    trip.role === "owner" ? listAccommodationLinkOptions(trip.id) : Promise.resolve([]),
    trip.role === "owner" ? listTransportLinkOptions(trip.id) : Promise.resolve([]),
  ]);

  return (
    <>
      <TripHeader
        title="הגדרות"
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      <AppPage width="content">
        <div className={sectionStyles.settingsStack}>
          <TripDetailsSection trip={trip} />
          <TripCoverSettings
            tripId={trip.id}
            hasCover={Boolean(trip.coverImage)}
            isOwner={trip.role === "owner"}
          />
          {trip.role === "owner" ? (
            <TripAccommodationSettings
              tripId={trip.id}
              startDate={trip.startDate}
              endDate={trip.endDate}
              accommodations={accommodations}
            />
          ) : null}
          {trip.role === "owner" ? (
            <TripDocumentSettings
              tripId={trip.id}
              documents={documents}
              activityOptions={activityOptions}
              accommodationOptions={accommodationOptions}
              transportOptions={transportOptions}
            />
          ) : null}
          <TripReminderSettings
            tripId={trip.id}
            startDate={trip.startDate}
            endDate={trip.endDate}
            reminders={reminders}
          />
        </div>
      </AppPage>
    </>
  );
}
