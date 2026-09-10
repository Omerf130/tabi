import Link from "next/link";
import { LogoutButton } from "@/app/app/LogoutButton";
import { getCurrentUser } from "@/features/auth/session";
import styles from "./TripManagementShell.module.scss";

export async function TripManagementAccountFooter() {
  const user = await getCurrentUser();

  return (
    <footer className={styles.accountFooter} aria-label="חשבון וניווט">
      <Link href="/app/trips" className={styles.accountTripsLink}>
        הטיולים שלי
      </Link>
      {user ? (
        <div className={styles.accountCard}>
          <p className={styles.accountName}>{user.name}</p>
          <p className={styles.accountEmail}>{user.email}</p>
        </div>
      ) : null}
      <LogoutButton />
    </footer>
  );
}
