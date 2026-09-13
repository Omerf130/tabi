"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconActivityTransport } from "@/components/ui/icons";
import { EntityLinkedCostDisplay } from "@/features/finance/EntityLinkedCostDisplay.client";
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
  const tCommon = useTranslations("Common");

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
                          {tCommon("edit")}
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
                  <EntityLinkedCostDisplay linkedCost={transport.linkedCost} />
                </p>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </li>
  );
}
