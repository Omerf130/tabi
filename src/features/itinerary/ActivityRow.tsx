"use client";

import { useState, type ReactNode } from "react";
import { ACTIVITY_TYPE_ICONS } from "./activity-type-icons";
import { isGoogleBackedActivity } from "./activity-place-domain";
import { ActivityShowDriverOverlay } from "./ActivityShowDriverOverlay.client";
import type { ActivityViewModel } from "./types";
import styles from "./ItineraryPage.module.scss";

type ActivityRowProps = {
  activity: ActivityViewModel;
  isOwner: boolean;
  actions?: ReactNode;
};

export function ActivityRow({ activity, isOwner, actions }: ActivityRowProps) {
  const Icon = ACTIVITY_TYPE_ICONS[activity.type];
  const [showDriver, setShowDriver] = useState(false);
  const locationLine = [activity.locationName, activity.address]
    .filter(Boolean)
    .join(" · ");
  const canNavigate = Boolean(activity.googleMapsUrl?.trim());
  const canShowDriver =
    isGoogleBackedActivity(activity) &&
    Boolean(activity.locationName?.trim() || activity.address?.trim());

  return (
    <>
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
                {canNavigate || canShowDriver ? (
                  <div className={styles.activityLocationActions}>
                    {canNavigate ? (
                      <a
                        className={styles.activityLocationAction}
                        href={activity.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ניווט
                      </a>
                    ) : null}
                    {canShowDriver ? (
                      <button
                        type="button"
                        className={styles.activityLocationAction}
                        onClick={() => setShowDriver(true)}
                      >
                        הצג לנהג
                      </button>
                    ) : null}
                  </div>
                ) : null}
                {activity.linkedCost ? (
                  <p className={styles.activityNotes}>{activity.linkedCost.label}</p>
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
      {showDriver ? (
        <ActivityShowDriverOverlay
          activity={activity}
          onClose={() => setShowDriver(false)}
        />
      ) : null}
    </>
  );
}
