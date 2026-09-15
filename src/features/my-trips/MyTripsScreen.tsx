import type { PublicUser } from "@/features/auth/public-user";
import { buildUserProfileImageHref } from "@/features/account/profile-image/constants";
import { loadProfileUserRecord } from "@/features/account/load-profile-user";
import { MyTripsContent } from "./MyTripsContent.client";
import { MyTripsHero } from "./MyTripsHero";
import type { MyTripsCardItem } from "./types";
import styles from "./MyTripsScreen.module.scss";

type MyTripsScreenProps = {
  user: PublicUser;
  trips: MyTripsCardItem[];
};

export async function MyTripsScreen({ user, trips }: MyTripsScreenProps) {
  const record = await loadProfileUserRecord(user.id);
  const avatarHref =
    record?.hasProfileImage === true
      ? buildUserProfileImageHref(user.id)
      : undefined;

  return (
    <div className={styles.screen}>
      <MyTripsHero userName={user.name} avatarHref={avatarHref} />
      <MyTripsContent trips={trips} />
    </div>
  );
}
