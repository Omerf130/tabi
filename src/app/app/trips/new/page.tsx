import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/app/app/LogoutButton";
import { Card } from "@/components/ui/Card/Card";
import { AppPage } from "@/features/app-shell/AppPage";
import { GlobalAppShell } from "@/features/app-shell/GlobalAppShell";
import { requireUser } from "@/features/auth/session";
import { CreateTripForm } from "@/features/trips/CreateTripForm";
import { countTripsForUser } from "@/features/trips/queries";
import styles from "@/features/trips/Trips.module.scss";

export const metadata: Metadata = {
  title: "טיול חדש · Tabi",
};

export default async function NewTripPage() {
  const user = await requireUser();
  const tripCount = await countTripsForUser(user.id);
  const isFirstTrip = tripCount === 0;

  return (
    <GlobalAppShell
      title={isFirstTrip ? "בואו ניצור את הטיול הראשון" : "טיול חדש"}
      trailing={!isFirstTrip ? <LogoutButton /> : undefined}
    >
      <AppPage width="content">
        <div className={styles.intro}>
          <p className={styles.lede}>
            {isFirstTrip
              ? "שם, תאריך התחלה ותאריך סיום — ואפשר להמשיך."
              : "הוסיפו טיול נוסף לחשבון שלכם."}
          </p>
        </div>
        <Card>
          <CreateTripForm />
        </Card>
        {!isFirstTrip ? (
          <p>
            <Link href="/app/trips" className={styles.link}>
              חזרה לרשימת הטיולים
            </Link>
          </p>
        ) : null}
      </AppPage>
    </GlobalAppShell>
  );
}
