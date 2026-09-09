import { HeroComposition } from "../compositions/HeroComposition";
import { MarketingLink } from "../MarketingLink";
import { RouteDecoration } from "../RouteDecoration";
import styles from "../landing.module.scss";

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.heroAtmosphere} aria-hidden="true" />
      <RouteDecoration variant="curve" className={styles.heroRouteDecor} />

      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.heroCoord} aria-hidden="true">
            41.3851° N · GLOBAL TRAVEL
          </p>
          <h1 id="hero-heading" className={styles.heroTitle}>
            הטיול שלכם.
            <br />
            <span className={styles.heroTitleAccent}>סוף סוף במקום אחד.</span>
          </h1>
          <p className={styles.heroLead}>
            מסלול, הזמנות, לינה, תחבורה, מסמכים וכל מה שצריך בדרך — Tabi מרכזת
            את הטיול שלכם באפליקציה אחת.
          </p>
          <div className={styles.heroActions}>
            <MarketingLink href="/register" variant="primary">
              מתחילים לתכנן
            </MarketingLink>
            <MarketingLink href="/login" variant="secondary">
              התחברות
            </MarketingLink>
          </div>
          <p className={styles.heroTrust}>
            פשוט לפתוח טיול, להזמין את מי שטס איתכם ולהתחיל.
          </p>
        </div>

        <div className={styles.heroVisual}>
          <HeroComposition />
        </div>
      </div>
    </section>
  );
}
