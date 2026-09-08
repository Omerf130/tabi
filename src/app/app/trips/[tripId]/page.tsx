import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge/Badge";
import { AppPage } from "@/features/app-shell/AppPage";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { requireTripMember } from "@/features/trips/authorization";
import {
  formatCalendarDateRangeDisplay,
  getJapanCalendarDate,
} from "@/features/trips/calendar-date";
import { TRIP_PHASE_LABELS, TRIP_ROLE_LABELS } from "@/features/trips/constants";
import { getTripPhase, type TripPhase } from "@/features/trips/trip-phase";
import styles from "./TripHome.module.scss";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `${trip.name} · Tabi` };
}

function phaseTone(phase: TripPhase) {
  if (phase === "active") return "success" as const;
  if (phase === "upcoming") return "accent" as const;
  return "neutral" as const;
}

export default async function TripHomePage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  const phase = getTripPhase(
    trip.startDate,
    trip.endDate,
    getJapanCalendarDate(),
  );

  return (
    <>
      <TripHeader title={trip.name} />
      <AppPage width="content">
        <div className={styles.intro}>
          <Badge tone={phaseTone(phase)}>{TRIP_PHASE_LABELS[phase]}</Badge>
          <p className={styles.dates}>
            {formatCalendarDateRangeDisplay(trip.startDate, trip.endDate)}
          </p>
          <p className={styles.role}>{TRIP_ROLE_LABELS[trip.role]}</p>
          <p className={styles.lede}>
            מסך הבית המלא יגיע בשלב הבא. בינתיים אפשר לנווט בין חלקי הטיול.
          </p>
        </div>
      </AppPage>
    </>
  );
}
