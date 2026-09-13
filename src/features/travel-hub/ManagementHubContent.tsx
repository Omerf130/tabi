import Link from "next/link";
import { LogoutButton } from "@/app/app/LogoutButton";
import { Card } from "@/components/ui/Card/Card";
import { IconMembers, IconSettings, IconTrips } from "@/components/ui/icons";
import { getCurrentUser } from "@/features/auth/session";
import { AppPage } from "@/features/app-shell/AppPage";
import { getTranslations } from "next-intl/server";
import styles from "./ManagementHub.module.scss";

type ManagementHubContentProps = {
  tripId: string;
};

export async function ManagementHubContent({ tripId }: ManagementHubContentProps) {
  const user = await getCurrentUser();
  const t = await getTranslations("TravelHub");
  const tAccount = await getTranslations("AccountMenu");

  return (
    <AppPage width="content">
      <section className={styles.section} aria-labelledby="management-links-title">
        <h2 id="management-links-title" className={styles.sectionTitle}>
          {t("managementHubTitle")}
        </h2>
        <div className={styles.managementList}>
          <Link href={`/app/trips/${tripId}/settings`} className={styles.row}>
            <IconSettings className={styles.rowIcon} aria-hidden />
            <span>{t("tripSettings")}</span>
          </Link>
          <Link href={`/app/trips/${tripId}/members`} className={styles.row}>
            <IconMembers className={styles.rowIcon} aria-hidden />
            <span>{t("tripMembers")}</span>
          </Link>
          <Link href="/app/trips" className={styles.row}>
            <IconTrips className={styles.rowIcon} aria-hidden />
            <span>{tAccount("myTrips")}</span>
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
