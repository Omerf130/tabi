"use client";

import { useTranslations } from "next-intl";
import { logoutAction } from "@/features/auth/actions";
import styles from "./MyTripsScreen.module.scss";

type MyTripsAccountAffordanceProps = {
  userName: string;
  variant?: "hero" | "default";
};

function getInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase() || "T";
}

export function MyTripsAccountAffordance({
  userName,
  variant = "default",
}: MyTripsAccountAffordanceProps) {
  const t = useTranslations("MyTrips.account");
  const initial = getInitial(userName);

  return (
    <details
      className={
        variant === "hero" ? `${styles.accountMenu} ${styles.accountMenuHero}` : styles.accountMenu
      }
    >
      <summary className={styles.accountTrigger} aria-label={t("menuAriaLabel")}>
        <span
          className={
            variant === "hero"
              ? `${styles.accountAvatar} ${styles.accountAvatarHero}`
              : styles.accountAvatar
          }
          aria-hidden="true"
        >
          {initial}
        </span>
      </summary>
      <div className={styles.accountPanel}>
        <p className={styles.accountName}>{userName}</p>
        <form action={logoutAction}>
          <button type="submit" className={styles.accountSignOut}>
            {t("signOut")}
          </button>
        </form>
      </div>
    </details>
  );
}
