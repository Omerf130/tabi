import Link from "next/link";
import { LogoutButton } from "@/app/app/LogoutButton";
import { Card } from "@/components/ui/Card/Card";
import { IconMembers, IconTrips } from "@/components/ui/icons";
import { getCurrentUser } from "@/features/auth/session";
import { AppPage } from "./AppPage";
import styles from "./MorePage.module.scss";

type MorePageContentProps = {
  tripId: string;
};

export async function MorePageContent({ tripId }: MorePageContentProps) {
  const user = await getCurrentUser();

  return (
    <AppPage width="content">
      <div className={styles.list}>
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
