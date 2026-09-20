"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LogoutWithPushCleanup } from "@/features/push/LogoutWithPushCleanup.client";
import { buildProfileHrefWithReturnTo } from "@/features/account/profile-return-to";
import { UserAvatar } from "@/features/account/UserAvatar";
import styles from "./MyTripsScreen.module.scss";

type MyTripsAccountAffordanceProps = {
  userName: string;
  avatarHref?: string;
  variant?: "hero" | "default";
};

export function MyTripsAccountAffordance({
  userName,
  avatarHref,
  variant = "default",
}: MyTripsAccountAffordanceProps) {
  const t = useTranslations("MyTrips.account");
  const profileHref = buildProfileHrefWithReturnTo("/app");

  return (
    <details
      className={
        variant === "hero" ? `${styles.accountMenu} ${styles.accountMenuHero}` : styles.accountMenu
      }
    >
      <summary className={styles.accountTrigger} aria-label={t("menuAriaLabel")}>
        <UserAvatar
          name={userName}
          avatarHref={avatarHref}
          className={
            variant === "hero"
              ? `${styles.accountAvatar} ${styles.accountAvatarHero}`
              : styles.accountAvatar
          }
        />
      </summary>
      <div className={styles.accountPanel}>
        <p className={styles.accountName}>{userName}</p>
        <Link href={profileHref} className={styles.accountProfileLink}>
          {t("profile")}
        </Link>
        <LogoutWithPushCleanup>
          <button type="submit" className={styles.accountSignOut}>
            {t("signOut")}
          </button>
        </LogoutWithPushCleanup>
      </div>
    </details>
  );
}
