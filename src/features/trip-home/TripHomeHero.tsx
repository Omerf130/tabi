import { getTranslations } from "next-intl/server";
import { TabiLogo } from "@/features/brand/TabiLogo";
import type { TripHomeHeroViewModel } from "./types";
import type { TripPhase } from "@/features/trips/trip-phase";
import styles from "./TripHomeContent.module.scss";

type TripHomeHeroProps = {
  hero: TripHomeHeroViewModel;
  phase: TripPhase;
};

export async function TripHomeHero({ hero, phase }: TripHomeHeroProps) {
  const [t, tCommon] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Common"),
  ]);
  const hasImage = Boolean(hero.heroImageSrc);

  return (
    <section
      className={styles.hero}
      data-phase={phase}
      data-has-image={hasImage ? "true" : "false"}
      aria-label={t("heroIdentityAria")}
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
          <>
            <p className={styles.heroTripIdentity}>{hero.tripName}</p>
            <p className={styles.heroTripRange}>{hero.dateRangeLabel}</p>
            <h1 className={styles.heroDayHeadline}>
              {tCommon("dayMeta", {
                dayNumber: hero.currentDay.dayNumber,
                totalDays: hero.currentDay.totalDays,
              })}
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
          </>
        ) : phase === "completed" ? (
          <>
            <TabiLogo
              variant="compact"
              tone="light"
              decorative
              className={styles.heroBrandLogo}
            />
            <p className={styles.heroTripIdentity}>
              {hero.tripIdentityLabel ?? hero.tripName}
            </p>
            <p className={styles.heroTripRange}>{hero.dateRangeLabel}</p>
            {hero.completionMessage ? (
              <h1 className={styles.heroCompletedHeadline}>
                {hero.completionMessage}
              </h1>
            ) : null}
          </>
        ) : (
          <>
            <TabiLogo
              variant="compact"
              tone="light"
              decorative
              className={styles.heroBrandLogo}
            />
            <h1 className={styles.heroTitle}>{hero.tripName}</h1>
            <p className={styles.heroDates}>{hero.dateRangeLabel}</p>
          </>
        )}
      </div>
    </section>
  );
}
