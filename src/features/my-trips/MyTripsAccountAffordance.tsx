"use client";

import { logoutAction } from "@/features/auth/actions";
import styles from "./MyTripsScreen.module.scss";

type MyTripsAccountAffordanceProps = {
  userName: string;
};

function getInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase() || "T";
}

export function MyTripsAccountAffordance({
  userName,
}: MyTripsAccountAffordanceProps) {
  const initial = getInitial(userName);

  return (
    <details className={styles.accountMenu}>
      <summary
        className={styles.accountTrigger}
        aria-label="Account menu"
      >
        <span className={styles.accountAvatar} aria-hidden="true">
          {initial}
        </span>
      </summary>
      <div className={styles.accountPanel}>
        <p className={styles.accountName}>{userName}</p>
        <form action={logoutAction}>
          <button type="submit" className={styles.accountSignOut}>
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
