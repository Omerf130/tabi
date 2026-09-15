import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { TabiBrandMark } from "@/features/welcome/TabiBrandMark";
import { MY_TRIPS_HERO_VISUAL } from "./constants";
import { MyTripsAccountAffordance } from "./MyTripsAccountAffordance";
import styles from "./MyTripsScreen.module.scss";

type MyTripsHeroProps = {
  userName: string;
  avatarHref?: string;
};

export async function MyTripsHero({ userName, avatarHref }: MyTripsHeroProps) {
  const t = await getTranslations("MyTrips");

  return (
    <header className={styles.hero}>
      <div className={styles.heroMedia} aria-hidden="true">
        <Image
          src={MY_TRIPS_HERO_VISUAL}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
      </div>

      <div className={styles.heroTopBar}>
        <div className={styles.heroBrand}>
          <TabiBrandMark className={styles.heroMark} />
          <span className={styles.heroBrandName}>{t("brandName")}</span>
        </div>
        <MyTripsAccountAffordance
          userName={userName}
          avatarHref={avatarHref}
          variant="hero"
        />
      </div>

      <div className={styles.heroCopy}>
        <h1 className={styles.heroTitle}>{t("title")}</h1>
        <p className={styles.heroSubtitle}>{t("subtitle")}</p>
      </div>
    </header>
  );
}
