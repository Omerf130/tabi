import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LogoutButton } from "@/app/app/LogoutButton";
import { getCurrentUser } from "@/features/auth/session";
import { InterfaceLanguagePreference } from "@/features/i18n/components/InterfaceLanguagePreference";
import styles from "./TripManagementShell.module.scss";

export async function TripManagementAccountFooter() {
  const user = await getCurrentUser();
  const t = await getTranslations("AccountMenu");

  return (
    <footer className={styles.accountFooter} aria-label={t("footerAriaLabel")}>
      <Link href="/app/trips" className={styles.accountTripsLink}>
        {t("myTrips")}
      </Link>
      {user ? (
        <>
          <div className={styles.accountCard}>
            <p className={styles.accountName}>{user.name}</p>
            <p className={styles.accountEmail}>{user.email}</p>
          </div>
          <InterfaceLanguagePreference currentLocale={user.locale} />
        </>
      ) : null}
      <LogoutButton />
    </footer>
  );
}
