import type { CSSProperties } from "react";
import { POCKET_ORBIT } from "../mock-data";
import { MarketingPhone } from "../MarketingPhone";
import { TravelHubScreen } from "../screens/TravelHubScreen";
import styles from "../landing.module.scss";

export function PocketSection() {
  return (
    <section
      id="whats-waiting"
      className={styles.pocket}
      aria-labelledby="pocket-heading"
    >
      <div className={styles.pocketIntro}>
        <h2 id="pocket-heading" className={styles.sectionTitle}>
          כל הטיול.
          <span className={styles.titleAccent}> בכיס שלכם.</span>
        </h2>
        <p className={styles.sectionLead}>
          Tabi היא לא רק מסלול — היא הבית התפעולי של הטיול, עם כל מה שצריך
          לפני ובמהלך הנסיעה.
        </p>
      </div>

      <div className={styles.pocketStage} aria-hidden="true">
        <div className={styles.pocketGlow} />

        <ul className={styles.pocketOrbit}>
          {POCKET_ORBIT.map((item, index) => (
            <li
              key={item.id}
              className={styles.pocketOrbitItem}
              data-tone={item.tone}
              style={{ "--orbit-i": index } as CSSProperties}
            >
              {item.label}
            </li>
          ))}
        </ul>

        <MarketingPhone size="large" className={styles.pocketPhone}>
          <TravelHubScreen />
        </MarketingPhone>
      </div>
    </section>
  );
}
