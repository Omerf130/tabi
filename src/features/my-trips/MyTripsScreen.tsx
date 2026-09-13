import type { PublicUser } from "@/features/auth/public-user";
import { MyTripsContent } from "./MyTripsContent.client";
import { MyTripsHero } from "./MyTripsHero";
import type { MyTripsCardItem } from "./types";
import styles from "./MyTripsScreen.module.scss";

type MyTripsScreenProps = {
  user: PublicUser;
  trips: MyTripsCardItem[];
};

export function MyTripsScreen({ user, trips }: MyTripsScreenProps) {
  return (
    <div className={styles.screen} dir="ltr" lang="en">
      <MyTripsHero userName={user.name} />
      <MyTripsContent trips={trips} />
    </div>
  );
}
