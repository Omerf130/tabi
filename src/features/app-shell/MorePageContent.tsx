import Link from "next/link";
import { LogoutButton } from "@/app/app/LogoutButton";
import { Card } from "@/components/ui/Card/Card";
import {
  IconAccommodation,
  IconGrid,
  IconMembers,
  IconTrips,
} from "@/components/ui/icons";
import { getCurrentUser } from "@/features/auth/session";
import { buildAccommodationListHref } from "@/features/accommodations/constants";
import { buildListsLandingHref } from "@/features/lists/constants";
import { AppPage } from "./AppPage";
import styles from "./MorePage.module.scss";

type MorePageContentProps = {
  tripId: string;
};

export async function MorePageContent({ tripId }: MorePageContentProps) {
  const user = await getCurrentUser();

  return (
    <AppPage width="content">
      <section className={styles.section} aria-labelledby="travel-tools-title">
        <h2 id="travel-tools-title" className={styles.sectionTitle}>
          כלי נסיעה
        </h2>
        <div className={styles.toolsGrid}>
          <Link
            href={buildAccommodationListHref(tripId)}
            className={styles.toolCard}
          >
            <IconAccommodation className={styles.toolIcon} />
            <span className={styles.toolLabel}>מקומות לינה</span>
          </Link>
          <Link href={buildListsLandingHref(tripId)} className={styles.toolCard}>
            <IconGrid className={styles.toolIcon} />
            <span className={styles.toolLabel}>רשימות</span>
          </Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="management-title">
        <h2 id="management-title" className={styles.sectionTitle}>
          ניהול
        </h2>
        <div className={styles.managementList}>
          <Link href={`/app/trips/${tripId}/members`} className={styles.row}>
            <IconMembers className={styles.rowIcon} />
            <span>חברי הטיול</span>
          </Link>
          <Link href={`/app/trips/${tripId}/settings`} className={styles.row}>
            <IconTrips className={styles.rowIcon} />
            <span>הגדרות הטיול</span>
          </Link>
          <Link href="/app/trips" className={styles.row}>
            <IconTrips className={styles.rowIcon} />
            <span>הטיולים שלי</span>
          </Link>
        </div>
      </section>

      {user ? (
        <Card variant="standard">
          <div className={styles.account}>
            <p className={styles.accountName}>{user.name}</p>
            <p className={styles.accountEmail}>{user.email}</p>
          </div>
        </Card>
      ) : null}

      <div className={styles.logout}>
        <LogoutButton />
      </div>
    </AppPage>
  );
}
