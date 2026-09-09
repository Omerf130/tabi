import { HOW_IT_WORKS_STEPS } from "../mock-data";
import { RouteDecoration } from "../RouteDecoration";
import styles from "../landing.module.scss";

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className={styles.howItWorks}
      aria-labelledby="how-it-works-heading"
    >
      <div className={styles.howItWorksIntro}>
        <h2 id="how-it-works-heading" className={styles.sectionTitle}>
          איך זה עובד
        </h2>
        <RouteDecoration variant="dots" className={styles.howRouteDecor} />
      </div>

      <ol className={styles.journeyPath}>
        {HOW_IT_WORKS_STEPS.map((step) => (
          <li key={step.step} className={styles.journeyStep}>
            <span className={styles.journeyNumber}>{step.step}</span>
            <div className={styles.journeyBody}>
              <h3 className={styles.journeyTitle}>{step.title}</h3>
              <p className={styles.journeyDesc}>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
