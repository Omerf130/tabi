"use client";

import { useState } from "react";
import { ActivityRow } from "./ActivityRow";
import { ActivityRowActions } from "./ActivityRowActions";
import { TransportItineraryRow } from "./TransportItineraryRow";
import type { DayWorkspaceViewModel } from "./types";
import styles from "./ItineraryExperience.module.scss";

export type ActivityPhotoMap = Readonly<Record<string, string>>;

type DayTimelineProps = {
  tripId: string;
  day: Pick<DayWorkspaceViewModel, "date" | "items" | "isOwner">;
  activityPhotos?: ActivityPhotoMap;
  onEditActivity: (activityId: string) => void;
  onMoveActivity: (activityId: string) => void;
  onEditTransport: (transportId: string) => void;
};

export function DayTimeline({
  tripId,
  day,
  activityPhotos = {},
  onEditActivity,
  onMoveActivity,
  onEditTransport,
}: DayTimelineProps) {
  const [actionsOpenId, setActionsOpenId] = useState<string | null>(null);

  return (
    <section className={styles.timelineSection} aria-labelledby="day-timeline-title">
      <h2 id="day-timeline-title" className={styles.srOnly}>
        לוח היום
      </h2>

      {day.items.length > 0 ? (
        <ul className={styles.timelineList}>
          {day.items.map((item) => {
            if (item.kind === "transport") {
              return (
                <TransportItineraryRow
                  key={`transport-${item.transport.id}`}
                  transport={item.transport}
                  isOwner={day.isOwner}
                  onEdit={() => onEditTransport(item.transport.id)}
                />
              );
            }

            return (
              <ActivityRow
                key={item.activity.id}
                activity={item.activity}
                isOwner={day.isOwner}
                photoHref={activityPhotos[item.activity.id]}
                actions={
                  day.isOwner ? (
                    <ActivityRowActions
                      tripId={tripId}
                      activityId={item.activity.id}
                      isOpen={actionsOpenId === item.activity.id}
                      onToggle={() =>
                        setActionsOpenId((current) =>
                          current === item.activity.id ? null : item.activity.id,
                        )
                      }
                      onEdit={() => onEditActivity(item.activity.id)}
                      onMove={() => onMoveActivity(item.activity.id)}
                      onMutation={() => setActionsOpenId(null)}
                    />
                  ) : undefined
                }
              />
            );
          })}
        </ul>
      ) : (
        <div className={styles.emptyDay}>
          <p className={styles.emptyDayTitle}>אין עדיין תוכניות ליום הזה</p>
          {day.isOwner ? (
            <p className={styles.emptyDayHint}>
              הוסיפו פעילויות, תחבורה או תזכורות כדי לבנות את היום.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
