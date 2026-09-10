import Link from "next/link";
import { IconActivityTransport } from "@/components/ui/icons";
import { formatEntityLinkedCostDisplay } from "@/features/finance/entity-linked-cost-presentation";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";
import actionStyles from "./ItineraryPage.module.scss";
import styles from "./ItineraryExperience.module.scss";

type TransportItineraryRowProps = {
  transport: TransportItineraryItemViewModel;
  isOwner?: boolean;
  onEdit?: () => void;
};

export function TransportItineraryRow({
  transport,
  isOwner = false,
  onEdit,
}: TransportItineraryRowProps) {
  return (
    <li className={styles.timelineEntry}>
      <time className={styles.timelineTime}>{transport.departureTime}</time>

      <div className={styles.timelineTrack} aria-hidden>
        <span className={`${styles.timelineDot} ${styles.timelineDotTransport}`} />
      </div>

      <div className={styles.timelineCardWrap}>
        <article className={styles.timelineCard}>
          <div className={styles.timelineCardBodyNoPhoto}>
            <div className={styles.timelineCardContent}>
              <div className={styles.timelineCardHeader}>
                <div className={styles.timelineCardTitleRow}>
                  <span
                    className={styles.timelineCardIconWrap}
                    data-type="transport"
                    aria-label={transport.typeLabel}
                  >
                    <IconActivityTransport
                      className={styles.timelineCardIcon}
                      aria-hidden
                    />
                  </span>
                  <Link href={transport.detailHref} className={styles.timelineCardLink}>
                    <h3 className={styles.timelineCardTitle} dir="auto">
                      {transport.routeLabel}
                    </h3>
                  </Link>
                </div>
                {isOwner && onEdit ? (
                  <div className={actionStyles.activityActionsSlot}>
                    <div className={actionStyles.activityActions}>
                      <div className={actionStyles.activityActionRow}>
                        <button
                          type="button"
                          className={actionStyles.actionLink}
                          onClick={onEdit}
                        >
                          עריכה
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <p className={styles.timelineCardMeta}>{transport.typeLabel}</p>

              {transport.metaLabel ? (
                <p className={styles.timelineCardLocation} dir="auto">
                  {transport.metaLabel}
                </p>
              ) : null}

              {transport.timeLabel ? (
                <p className={styles.timelineCardMeta}>{transport.timeLabel}</p>
              ) : null}

              {transport.linkedCost ? (
                <p className={styles.timelineCardCost}>
                  {formatEntityLinkedCostDisplay(transport.linkedCost)}
                </p>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </li>
  );
}
