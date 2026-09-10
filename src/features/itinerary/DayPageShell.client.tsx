"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { getAccommodationsSettingsHref } from "@/features/accommodations/constants";
import type { DayDocumentLinkOptions } from "./build-day-document-link-options";
import { DayActionSurface } from "./DayActionSurface.client";
import type { DayActionState } from "./day-action-surface.types";
import { DayRemindersSection } from "./DayRemindersSection.client";
import { DayWorkspace } from "./DayWorkspace.client";
import type { ActivityPhotoMap } from "./DayTimeline.client";
import type { DayWorkspaceViewModel } from "./types";
import type { TransportRecord } from "@/features/transport/types";
import styles from "./ItineraryExperience.module.scss";

type DayPageShellProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  day: DayWorkspaceViewModel;
  documentLinkOptions: DayDocumentLinkOptions;
  transportRecords: ReadonlyMap<string, TransportRecord>;
  activityPhotos?: ActivityPhotoMap;
};

export function DayPageShell({
  tripId,
  startDate,
  endDate,
  day,
  documentLinkOptions,
  transportRecords,
  activityPhotos,
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
  const hasSideAccommodations = day.accommodations.length > 0;
  const hasSideDocuments = day.documents.length > 0;

  return (
    <>
      <div className={styles.dayLayout}>
        <div className={styles.mainColumn}>
          <DayWorkspace
            tripId={tripId}
            day={day}
            activityPhotos={activityPhotos}
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

          {day.isOwner ? (
            <div className={styles.addToDayBar}>
              <button
                type="button"
                className={styles.addToDayButton}
                onClick={openMenu}
              >
                + הוספת פריט ליום זה
              </button>
            </div>
          ) : null}
        </div>

        <aside className={styles.sideColumn} aria-label="מידע משלים ליום">
            {hasSideAccommodations ? (
              <section className={styles.sideSection} aria-labelledby="day-accommodation-title">
                <h2 id="day-accommodation-title" className={styles.sideSectionTitle}>
                  לינה
                </h2>
                <ul className={styles.sideList}>
                  {day.accommodations.map((accommodation) => (
                    <li key={accommodation.id}>
                      <Link
                        href={`/app/trips/${tripId}/accommodations/${accommodation.id}`}
                        className={styles.sideLink}
                      >
                        <span className={styles.sideLinkTitle} dir="auto">
                          {accommodation.name}
                        </span>
                        <span className={styles.sideLinkMeta}>
                          {accommodation.city} · {accommodation.dateRangeLabel}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {day.isOwner ? (
                  <Link
                    href={getAccommodationsSettingsHref(tripId)}
                    className={styles.timelineLocationAction}
                  >
                    {day.accommodations.length === 1
                      ? "ניהול מקום הלינה"
                      : "ניהול מקומות לינה"}
                  </Link>
                ) : null}
              </section>
            ) : null}

            {hasSideDocuments ? (
              <section className={styles.sideSection} aria-labelledby="day-documents-title">
                <h2 id="day-documents-title" className={styles.sideSectionTitle}>
                  מסמכים
                </h2>
                <ul className={styles.sideList}>
                  {day.documents.map((document) => (
                    <li key={document.id}>
                      <Link href={document.detailHref} className={styles.sideLink}>
                        <span className={styles.sideLinkTitle} dir="auto">
                          {document.title}
                        </span>
                        <span className={styles.sideLinkMeta}>
                          {document.categoryLabel} · {document.fileTypeLabel}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

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
        </aside>
      </div>

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
        showCostFields={day.isOwner}
        financeBaseCurrency={day.financeBaseCurrency}
        currencies={day.currencies}
      />
    </>
  );
}
