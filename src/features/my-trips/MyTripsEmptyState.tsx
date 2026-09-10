import Image from "next/image";
import Link from "next/link";
import { CREATE_TRIP_PATH, MY_TRIPS_FALLBACK_VISUAL } from "./constants";
import styles from "./MyTripsScreen.module.scss";

export function MyTripsEmptyState() {
  return (
    <section className={styles.emptyState} aria-labelledby="my-trips-empty-title">
      <div className={styles.emptyVisual} aria-hidden="true">
        <Image
          src={MY_TRIPS_FALLBACK_VISUAL}
          alt=""
          fill
          sizes="(min-width: 768px) 480px, 100vw"
          className={styles.emptyImage}
        />
        <div className={styles.emptyOverlay} />
      </div>

      <div className={styles.emptyCopy}>
        <h2 id="my-trips-empty-title" className={styles.emptyTitle}>
          Your next adventure starts here.
        </h2>
        <p className={styles.emptyBody}>
          Plan your journey, day by day — all in one place.
        </p>
        <Link href={CREATE_TRIP_PATH} className={styles.emptyCta}>
          Create your first trip
        </Link>
      </div>
    </section>
  );
}
