import type { TripHomeHeroViewModel } from "./types";
import type { TripPhase } from "@/features/trips/trip-phase";
import styles from "./TripHomeContent.module.scss";

type TripHomeHeroProps = {
  hero: TripHomeHeroViewModel;
  phase: TripPhase;
};

function countdownUnit(days: number): string {
  if (days === 0) {
    return "היום";
  }
  if (days === 1) {
    return "יום";
  }
  return "ימים";
}

function countdownValue(days: number): string {
  return days === 0 ? "0" : String(days);
}

export function TripHomeHero({ hero, phase }: TripHomeHeroProps) {
  const hasImage = Boolean(hero.heroImageSrc);

  return (
    <section
      className={styles.hero}
      data-phase={phase}
      data-has-image={hasImage ? "true" : "false"}
      aria-label="זהות הטיול"
    >
      <div className={styles.heroMedia} aria-hidden>
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.heroImageSrc} alt="" className={styles.heroImage} />
        ) : null}
        <div className={styles.heroScrim} />
      </div>

      <div className={styles.heroContent}>
        {phase === "active" && hero.currentDay ? (
          <div className={styles.heroActiveLayout}>
            <div className={styles.heroActiveTop}>
              <p className={styles.heroTripIdentity}>{hero.tripName}</p>
              <p className={styles.heroTripRange}>{hero.dateRangeLabel}</p>
            </div>

            <div className={styles.heroActiveBottom}>
              <h1 className={styles.heroDayHeadline}>
                יום {hero.currentDay.dayNumber} מתוך {hero.currentDay.totalDays}
              </h1>
              <div className={styles.heroActiveContextRow}>
                <p className={styles.heroDateLine}>
                  {hero.currentDay.weekdayLabel} · {hero.currentDay.dateLabel}
                </p>
                {hero.weather ? (
                  <p className={styles.heroWeatherInline}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hero.weather.conditionIconUrl}
                      alt=""
                      className={styles.heroWeatherIcon}
                      width={18}
                      height={18}
                    />
                    <span className={styles.heroWeatherTemp}>
                      {hero.weather.temperatureLabel}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : phase === "completed" ? (
          <div className={styles.heroCompletedLayout}>
            <div className={styles.heroCompletedTop}>
              <p className={styles.heroTripIdentity}>
                {hero.tripIdentityLabel ?? hero.tripName}
              </p>
              <p className={styles.heroTripRange}>{hero.dateRangeLabel}</p>
            </div>

            <div className={styles.heroCompletedBottom}>
              {hero.completionMessage ? (
                <h1 className={styles.heroCompletedHeadline}>
                  {hero.completionMessage}
                </h1>
              ) : null}
              {hero.durationLabel ? (
                <p className={styles.heroDuration}>{hero.durationLabel}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <h1 className={styles.heroTitle}>{hero.tripName}</h1>
        )}

        {phase === "upcoming" ? (
          <>
            <p className={styles.heroDates}>{hero.dateRangeLabel}</p>
            {hero.countdownDays !== undefined ? (
              <div className={styles.heroCountdown} aria-label="ספירה לאחור">
                <span className={styles.countdownValue}>
                  {countdownValue(hero.countdownDays)}
                </span>
                <span className={styles.countdownUnit}>
                  {countdownUnit(hero.countdownDays)}
                </span>
                <span className={styles.countdownLabel}>עד הטיול</span>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
