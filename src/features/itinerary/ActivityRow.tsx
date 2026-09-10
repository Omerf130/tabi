"use client";

import { useState, type ReactNode } from "react";
import { ACTIVITY_TYPE_ICONS } from "./activity-type-icons";
import { isGoogleBackedActivity } from "./activity-place-domain";
import { ActivityShowDriverOverlay } from "./ActivityShowDriverOverlay.client";
import type { ActivityViewModel } from "./types";
import actionStyles from "./ItineraryPage.module.scss";
import styles from "./ItineraryExperience.module.scss";

type ActivityRowProps = {
  activity: ActivityViewModel;
  isOwner: boolean;
  actions?: ReactNode;
  photoHref?: string;
};

export function ActivityRow({
  activity,
  isOwner,
  actions,
  photoHref,
}: ActivityRowProps) {
  const Icon = ACTIVITY_TYPE_ICONS[activity.type];
  const [showDriver, setShowDriver] = useState(false);
  const hasPhoto = Boolean(photoHref);
  const locationLine = [activity.locationName, activity.address]
    .filter(Boolean)
    .join(" · ");
  const contextLine = [activity.city, activity.country].filter(Boolean).join(", ");
  const canNavigate = Boolean(activity.googleMapsUrl?.trim());
  const canShowDriver =
    isGoogleBackedActivity(activity) &&
    Boolean(activity.locationName?.trim() || activity.address?.trim());

  return (
    <>
      <li className={styles.timelineEntry}>
        {activity.timeLabel ? (
          <time className={styles.timelineTime} dateTime={activity.startTime}>
            {activity.timeLabel}
          </time>
        ) : (
          <span className={styles.timelineTimePlaceholder} aria-hidden />
        )}

        <div className={styles.timelineTrack} aria-hidden>
          <span className={styles.timelineDot} />
        </div>

        <div className={styles.timelineCardWrap}>
          <article className={styles.timelineCard}>
            <div
              className={
                hasPhoto ? styles.timelineCardBody : styles.timelineCardBodyNoPhoto
              }
            >
              <div className={styles.timelineCardContent}>
                <div className={styles.timelineCardHeader}>
                  <div className={styles.timelineCardTitleRow}>
                    <span
                      className={styles.timelineCardIconWrap}
                      data-type={activity.type}
                      aria-label={activity.typeLabel}
                    >
                      <Icon className={styles.timelineCardIcon} aria-hidden />
                    </span>
                    <h3 className={styles.timelineCardTitle} dir="auto">
                      {activity.title}
                    </h3>
                  </div>
                  {isOwner && actions ? (
                    <div className={actionStyles.activityActionsSlot}>{actions}</div>
                  ) : null}
                </div>

                {contextLine ? (
                  <p className={styles.timelineCardMeta} dir="auto">
                    {contextLine}
                  </p>
                ) : null}

                {locationLine ? (
                  <p className={styles.timelineCardLocation} dir="auto">
                    {locationLine}
                  </p>
                ) : null}

                {canNavigate || canShowDriver ? (
                  <div className={styles.timelineLocationActions}>
                    {canNavigate ? (
                      <a
                        className={styles.timelineLocationAction}
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
                        className={styles.timelineLocationAction}
                        onClick={() => setShowDriver(true)}
                      >
                        הצג לנהג
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {activity.linkedCost ? (
                  <p className={styles.timelineCardCost}>{activity.linkedCost.label}</p>
                ) : null}

                {activity.notes ? (
                  <p className={styles.timelineCardNotes} dir="auto">
                    {activity.notes}
                  </p>
                ) : null}
              </div>

              {hasPhoto ? (
                <div className={styles.timelineCardThumb}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoHref}
                    alt=""
                    className={styles.timelineCardThumbImage}
                  />
                </div>
              ) : null}
            </div>
          </article>
        </div>
      </li>

      {showDriver ? (
        <ActivityShowDriverOverlay
          activity={activity}
          onClose={() => setShowDriver(false)}
        />
      ) : null}
    </>
  );
}
