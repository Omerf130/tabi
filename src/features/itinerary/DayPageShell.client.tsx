"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { DayDocumentLinkOptions } from "./build-day-document-link-options";
import { DayActionSurface } from "./DayActionSurface.client";
import type { DayActionState } from "./day-action-surface.types";
import { DayRemindersSection } from "./DayRemindersSection.client";
import { DayWorkspace } from "./DayWorkspace.client";
import type { DayWorkspaceViewModel } from "./types";
import type { TransportRecord } from "@/features/transport/types";
import styles from "./DayPage.module.scss";

type DayPageShellProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  day: DayWorkspaceViewModel;
  documentLinkOptions: DayDocumentLinkOptions;
  transportRecords: ReadonlyMap<string, TransportRecord>;
};

export function DayPageShell({
  tripId,
  startDate,
  endDate,
  day,
  documentLinkOptions,
  transportRecords,
}: DayPageShellProps) {
  const [actionState, setActionState] = useState<DayActionState>({ kind: "closed" });

  const closeAction = useCallback(() => {
    setActionState({ kind: "closed" });
  }, []);

  const openMenu = useCallback(() => {
    setActionState({ kind: "menu" });
  }, []);

  const openReminderCreate = useCallback(() => {
    setActionState({ kind: "reminder-create" });
  }, []);

  const allReminders = [...day.incompleteReminders, ...day.completedReminders];

  return (
    <>
      <DayWorkspace
        tripId={tripId}
        day={day}
        onEditActivity={(activityId) =>
          setActionState({ kind: "activity-edit", activityId })
        }
        onMoveActivity={(activityId) =>
          setActionState({ kind: "activity-move", activityId })
        }
        onEditTransport={(transportId) =>
          setActionState({ kind: "transport-edit", transportId })
        }
      />

      <section className={styles.section} aria-labelledby="day-documents-title">
        <h2 id="day-documents-title" className={styles.sectionTitle}>
          מסמכים
        </h2>
        {day.documents.length > 0 ? (
          <ul className={styles.documentList}>
            {day.documents.map((document) => (
              <li key={document.id}>
                <Link href={document.detailHref} className={styles.documentLink}>
                  <span className={styles.documentTitle} dir="auto">
                    {document.title}
                  </span>
                  <span className={styles.documentMeta}>
                    {document.categoryLabel} · {document.fileTypeLabel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyState}>
            אין מסמכים המקושרים לפריטים ביום זה.
          </p>
        )}
      </section>

      <DayRemindersSection
        tripId={tripId}
        date={day.date}
        incompleteReminders={day.incompleteReminders}
        completedReminders={day.completedReminders}
        showCreateAction={!day.isOwner}
        onCreateRequest={openReminderCreate}
        onEditReminder={(reminderId) =>
          setActionState({ kind: "reminder-edit", reminderId })
        }
      />

      {day.isOwner ? (
        <div className={styles.addToDayBar}>
          <button type="button" className={styles.addToDayButton} onClick={openMenu}>
            + הוספה ליום
          </button>
        </div>
      ) : null}

      <DayActionSurface
        state={actionState}
        tripId={tripId}
        startDate={startDate}
        endDate={endDate}
        date={day.date}
        tripDates={day.tripDates}
        activities={day.activities}
        transportRecords={transportRecords}
        documentLinkOptions={documentLinkOptions}
        reminders={allReminders}
        onStateChange={setActionState}
        onClose={closeAction}
      />
    </>
  );
}
