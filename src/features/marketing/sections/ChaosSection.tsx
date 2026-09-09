import type { CSSProperties } from "react";
import { CHAOS_FRAGMENTS } from "../mock-data";
import { MarketingPhone } from "../MarketingPhone";
import { TripHomeScreen } from "../screens/TripHomeScreen";
import { RouteDecoration } from "../RouteDecoration";
import styles from "../landing.module.scss";

export function ChaosSection() {
  return (
    <section
      id="what-is-tabi"
      className={styles.chaos}
      aria-labelledby="chaos-heading"
    >
      <div className={styles.chaosInner}>
        <div className={styles.chaosCopy}>
          <h2 id="chaos-heading" className={styles.sectionTitle}>
            טיול אחד.
            <span className={styles.titleAccent}> עשר אפליקציות.</span>
          </h2>
          <p className={styles.sectionLead}>
            לפני Tabi, הטיול שלכם נמצא בכל מקום.
          </p>
          <ul className={styles.chaosBullets}>
            <li>אישור אחד במייל.</li>
            <li>כתובת בוואטסאפ.</li>
            <li>כרטיס בקובץ PDF.</li>
            <li>רשימה ב-Notes.</li>
            <li>והמסלול בכלל במקום אחר.</li>
          </ul>
          <p className={styles.chaosResolution}>
            Tabi מרכזת את כל מה שחשוב לטיול אחד מסודר.
          </p>
        </div>

        <div className={styles.chaosVisual} aria-hidden="true">
          <div className={styles.chaosScatter}>
            {CHAOS_FRAGMENTS.map((fragment, index) => (
              <span
                key={fragment.id}
                className={styles.chaosChip}
                data-tone={fragment.tone}
                style={{ "--chip-index": index } as CSSProperties}
              >
                {fragment.label}
              </span>
            ))}
          </div>

          <RouteDecoration variant="dots" className={styles.chaosRoute} />

          <div className={styles.chaosConverge}>
            <span className={styles.chaosTabiLabel}>Tabi</span>
            <MarketingPhone className={styles.chaosPhone}>
              <TripHomeScreen />
            </MarketingPhone>
          </div>
        </div>
      </div>
    </section>
  );
}
