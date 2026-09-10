"use client";

import { useState } from "react";
import { ActivityRow } from "./ActivityRow";
import { ActivityRowActions } from "./ActivityRowActions";
import { TransportItineraryRow } from "./TransportItineraryRow";
import type { DayWorkspaceViewModel } from "./types";
import styles from "./ItineraryPage.module.scss";

type DayTimelineProps = {
  tripId: string;
  day: Pick<DayWorkspaceViewModel, "date" | "items" | "isOwner">;
  onEditActivity: (activityId: string) => void;
  onMoveActivity: (activityId: string) => void;
  onEditTransport: (transportId: string) => void;
};

export function DayTimeline({
  tripId,
  day,
  onEditActivity,
  onMoveActivity,
  onEditTransport,
}: DayTimelineProps) {
  const [actionsOpenId, setActionsOpenId] = useState<string | null>(null);

  return (
    <section className={styles.timelineSection} aria-labelledby="day-timeline-title">
      <h2 id="day-timeline-title" className={styles.sectionTitle}>
        לוח היום
      </h2>

      {day.items.length > 0 ? (
        <div className={styles.activityList}>
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
        </div>
      ) : (
        <p className={styles.emptyDay}>אין פריטים ביום זה</p>
      )}
    </section>
  );
}
