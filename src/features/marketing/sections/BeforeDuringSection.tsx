import { MarketingPhone } from "../MarketingPhone";
import { DuringTripScreen } from "../screens/DuringTripScreen";
import { PlanningScreen } from "../screens/PlanningScreen";
import { RouteDecoration } from "../RouteDecoration";
import styles from "../landing.module.scss";

export function BeforeDuringSection() {
  return (
    <section className={styles.beforeDuring} aria-labelledby="before-during-heading">
      <div className={styles.beforeDuringIntro}>
        <h2 id="before-during-heading" className={styles.sectionTitle}>
          מהתכנון בבית
          <span className={styles.titleAccent}> ועד הרגע שאתם שם.</span>
        </h2>
      </div>

      <div className={styles.beforeDuringStage}>
        <article className={styles.phaseBlock} data-phase="before">
          <div className={styles.phaseBlockCopy}>
            <p className={styles.phaseKicker}>לפני הטיול</p>
            <h3 className={styles.phaseTitle}>בונים את הבסיס</h3>
            <p className={styles.phaseDesc}>
              מסלול, לינה, תחבורה, מסמכים ורשימות — הכל מתארגן לפני שיוצאים.
            </p>
          </div>
          <MarketingPhone tilt="right" className={styles.phasePhone}>
            <PlanningScreen />
          </MarketingPhone>
        </article>

        <RouteDecoration variant="curve" className={styles.phaseConnector} />

        <article className={styles.phaseBlock} data-phase="during">
          <div className={styles.phaseBlockCopy}>
            <p className={styles.phaseKicker}>במהלך הטיול</p>
            <h3 className={styles.phaseTitle}>משתמשים בזמן אמת</h3>
            <p className={styles.phaseDesc}>
              עכשיו, הבא בתור, מזג אוויר, מטבע, שפה וחירום — הכל ביד.
            </p>
          </div>
          <MarketingPhone tilt="left" className={styles.phasePhone}>
            <DuringTripScreen />
          </MarketingPhone>
        </article>
      </div>
    </section>
  );
}
