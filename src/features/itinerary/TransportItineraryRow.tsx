import Link from "next/link";
import { IconActivityTransport } from "@/components/ui/icons";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";
import styles from "./ItineraryPage.module.scss";

type TransportItineraryRowProps = {
  transport: TransportItineraryItemViewModel;
};

export function TransportItineraryRow({ transport }: TransportItineraryRowProps) {
  return (
    <article className={styles.activity}>
      <Link href={transport.detailHref} className={styles.transportRowLink}>
        <div className={styles.activityRow}>
          <p className={styles.activityTime}>{transport.departureTime}</p>
          <div className={styles.activityBody}>
            <div className={styles.activityMain}>
              <span className={styles.activityIconWrap} aria-label={transport.typeLabel}>
                <IconActivityTransport className={styles.activityIcon} aria-hidden />
              </span>
              <div className={styles.activityText}>
                <h3 className={styles.activityTitle} dir="auto">
                  {transport.routeLabel}
                </h3>
                {transport.metaLabel ? (
                  <p className={styles.activityLocation} dir="auto">
                    {transport.metaLabel}
                  </p>
                ) : null}
                <p className={styles.transportTimeMeta}>{transport.timeLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
