import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { HomeItineraryPreviewItem } from "./build-home-itinerary-preview";
import styles from "./TripHomeContent.module.scss";

type LaterTodaySectionProps = {
  items: HomeItineraryPreviewItem[];
};

export async function LaterTodaySection({ items }: LaterTodaySectionProps) {
  if (items.length === 0) {
    return null;
  }

  const [t, tCommon] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Common"),
  ]);

  return (
    <section className={styles.homeSection} aria-labelledby="trip-home-later-today">
      <h2 id="trip-home-later-today" className={styles.homeSectionTitle}>
        {t("laterTodayTitle")}
      </h2>
      <ul className={styles.laterTodayList}>
        {items.map((item, index) => {
          const row = (
            <>
              <time className={styles.laterTodayTime}>
                {item.isUntimed ? tCommon("noTime") : item.displayTime}
              </time>
              <div className={styles.laterTodayCopy}>
                <p className={styles.laterTodayTitle} dir="auto">
                  {item.title}
                </p>
                {item.locationName ? (
                  <p className={styles.laterTodayLocation} dir="auto">
                    {item.locationName}
                  </p>
                ) : null}
              </div>
            </>
          );

          return (
            <li
              key={item.id}
              className={styles.laterTodayItem}
              data-last={index === items.length - 1 ? "true" : undefined}
            >
              {item.detailHref ? (
                <Link href={item.detailHref} className={styles.laterTodayLink}>
                  {row}
                </Link>
              ) : (
                <div className={styles.laterTodayStatic}>{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
