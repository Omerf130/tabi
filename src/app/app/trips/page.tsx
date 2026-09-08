import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/app/app/LogoutButton";
import { Badge } from "@/components/ui/Badge/Badge";
import { Card } from "@/components/ui/Card/Card";
import { AppPage } from "@/features/app-shell/AppPage";
import { GlobalAppShell } from "@/features/app-shell/GlobalAppShell";
import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import {
  TRIP_PHASE_LABELS,
  TRIP_ROLE_LABELS,
} from "@/features/trips/constants";
import { requireUser } from "@/features/auth/session";
import { listTripsForUser } from "@/features/trips/queries";
import type { TripPhase } from "@/features/trips/trip-phase";
import styles from "@/features/trips/Trips.module.scss";

export const metadata: Metadata = {
  title: "הטיולים שלי · Tabi",
};

function phaseTone(phase: TripPhase) {
  if (phase === "active") return "success" as const;
  if (phase === "upcoming") return "accent" as const;
  return "neutral" as const;
}

export default async function TripsPage() {
  const user = await requireUser();
  const trips = await listTripsForUser(user.id);

  return (
    <GlobalAppShell title="הטיולים שלי" trailing={<LogoutButton />}>
      <AppPage width="wide">
        <div className={styles.intro}>
          <p className={styles.lede}>בחרו טיול להמשך או צרו טיול חדש.</p>
        </div>

        <div className={styles.actionsRow}>
          <Link href="/app/trips/new" className={styles.primaryLink}>
            טיול חדש
          </Link>
        </div>

        {trips.length === 0 ? (
          <p className={styles.lede}>עדיין אין טיולים. התחילו ביצירת הטיול הראשון.</p>
        ) : (
          <div className={styles.list}>
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/app/trips/${trip.id}`}
                className={styles.tripLink}
              >
                <Card variant="standard">
                  <article className={styles.tripCard}>
                    <div className={styles.tripHeader}>
                      <h2 className={styles.tripName}>{trip.name}</h2>
                      <Badge tone={phaseTone(trip.phase)}>
                        {TRIP_PHASE_LABELS[trip.phase]}
                      </Badge>
                    </div>
                    <p className={styles.tripMeta}>
                      {formatCalendarDateRangeDisplay(trip.startDate, trip.endDate)}
                    </p>
                    <p className={styles.tripMeta}>
                      {TRIP_ROLE_LABELS[trip.role]}
                    </p>
                  </article>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </AppPage>
    </GlobalAppShell>
  );
}
