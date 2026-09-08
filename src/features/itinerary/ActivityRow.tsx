import type { ReactNode } from "react";
import { ACTIVITY_TYPE_ICONS } from "./activity-type-icons";
import type { ActivityViewModel } from "./types";
import styles from "./ItineraryPage.module.scss";

type ActivityRowProps = {
  activity: ActivityViewModel;
  isOwner: boolean;
  actions?: ReactNode;
};

export function ActivityRow({ activity, isOwner, actions }: ActivityRowProps) {
  const Icon = ACTIVITY_TYPE_ICONS[activity.type];
  const locationLine = [activity.locationName, activity.address]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className={styles.activity}>
      <div className={styles.activityRow}>
        {activity.timeLabel ? (
          <p className={styles.activityTime}>{activity.timeLabel}</p>
        ) : (
          <span className={styles.activityTimePlaceholder} aria-hidden />
        )}
        <div className={styles.activityBody}>
          <div className={styles.activityMain}>
            <span className={styles.activityIconWrap} aria-label={activity.typeLabel}>
              <Icon className={styles.activityIcon} aria-hidden />
            </span>
            <div className={styles.activityText}>
              <h3 className={styles.activityTitle} dir="auto">
                {activity.title}
              </h3>
              {locationLine ? (
                <p className={styles.activityLocation} dir="auto">
                  {locationLine}
                </p>
              ) : null}
              {activity.notes ? (
                <p className={styles.activityNotes} dir="auto">
                  {activity.notes}
                </p>
              ) : null}
            </div>
          </div>
          {isOwner && actions ? (
            <div className={styles.activityActionsSlot}>{actions}</div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
