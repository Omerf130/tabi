import type { ItineraryHeroViewModel } from "./types";
import styles from "./ItineraryExperience.module.scss";

type ItineraryHeroProps = {
  hero: ItineraryHeroViewModel;
};

export function ItineraryHero({ hero }: ItineraryHeroProps) {
  return (
    <section className={styles.hero} aria-label={hero.title}>
      <div className={styles.heroMedia} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero.heroImageSrc} alt="" className={styles.heroImage} />
        <div className={styles.heroScrim} />
      </div>
      <div className={styles.heroBody}>
        <p className={styles.heroTripMeta}>
          {hero.identityLabel} · {hero.dateRangeLabel}
        </p>
        <h1 className={styles.heroTitle}>{hero.title}</h1>
      </div>
    </section>
  );
}
