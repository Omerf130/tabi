import { HERO_FLOATS } from "../mock-data";
import { MarketingPhone } from "../MarketingPhone";
import { ItineraryDayScreen } from "../screens/ItineraryDayScreen";
import { TripHomeScreen } from "../screens/TripHomeScreen";
import styles from "./compositions.module.scss";

export function HeroComposition() {
  return (
    <div className={styles.heroComposition} aria-hidden="true">
      <div className={styles.heroGlow} />
      <div className={styles.heroGlowSecondary} />

      {HERO_FLOATS.map((item) => (
        <div
          key={item.id}
          className={styles.heroFloat}
          data-id={item.id}
          data-tone={item.tone}
        >
          {item.label}
        </div>
      ))}

      <div className={styles.heroPhones}>
        <MarketingPhone size="large" layer="back" className={styles.heroPhoneBack}>
          <ItineraryDayScreen />
        </MarketingPhone>
        <MarketingPhone size="large" layer="front" className={styles.heroPhoneFront}>
          <TripHomeScreen />
        </MarketingPhone>
      </div>
    </div>
  );
}
