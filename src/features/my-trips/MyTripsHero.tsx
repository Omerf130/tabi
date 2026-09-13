import Image from "next/image";
import { TabiBrandMark } from "@/features/welcome/TabiBrandMark";
import { MY_TRIPS_HERO_VISUAL } from "./constants";
import { MyTripsAccountAffordance } from "./MyTripsAccountAffordance";
import styles from "./MyTripsScreen.module.scss";

type MyTripsHeroProps = {
  userName: string;
};

export function MyTripsHero({ userName }: MyTripsHeroProps) {
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
          <span className={styles.heroBrandName}>Tabi</span>
        </div>
        <MyTripsAccountAffordance userName={userName} variant="hero" />
      </div>

      <div className={styles.heroCopy}>
        <h1 className={styles.heroTitle}>My Trips</h1>
        <p className={styles.heroSubtitle}>Your adventures, all in one place.</p>
      </div>
    </header>
  );
}
