import Link from "next/link";
import { LogoutButton } from "@/app/app/LogoutButton";
import { Card } from "@/components/ui/Card/Card";
import { IconMembers, IconSettings, IconTrips } from "@/components/ui/icons";
import { getCurrentUser } from "@/features/auth/session";
import { AppPage } from "@/features/app-shell/AppPage";
import styles from "./ManagementHub.module.scss";

type ManagementHubContentProps = {
  tripId: string;
};

export async function ManagementHubContent({ tripId }: ManagementHubContentProps) {
  const user = await getCurrentUser();

  return (
    <AppPage width="content">
      <section className={styles.section} aria-labelledby="management-links-title">
        <h2 id="management-links-title" className={styles.sectionTitle}>
          הגדרות וניהול
        </h2>
        <div className={styles.managementList}>
          <Link href={`/app/trips/${tripId}/settings`} className={styles.row}>
            <IconSettings className={styles.rowIcon} aria-hidden />
            <span>הגדרות הטיול</span>
          </Link>
          <Link href={`/app/trips/${tripId}/members`} className={styles.row}>
            <IconMembers className={styles.rowIcon} aria-hidden />
            <span>חברי הטיול</span>
          </Link>
          <Link href="/app/trips" className={styles.row}>
            <IconTrips className={styles.rowIcon} aria-hidden />
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
