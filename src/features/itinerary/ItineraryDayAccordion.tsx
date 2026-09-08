"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge/Badge";
import { IconChevron } from "@/components/ui/icons";
import { ACTIVITY_TYPES } from "./activity-types";
import { ActivityForm } from "./ActivityForm";
import { ActivityMovePanel } from "./ActivityMovePanel";
import { ActivityRow } from "./ActivityRow";
import { ActivityRowActions } from "./ActivityRowActions";
import { ACTIVITY_MESSAGES } from "./constants";
import { formatDayActivityCount } from "./format-day-activity-count";
import { toActivityFormValues } from "./to-activity-view-model";
import type { ActivityActionState } from "./actions";
import type { ActivityViewModel, TripDayViewModel } from "./types";
import styles from "./ItineraryPage.module.scss";

type EditorState =
  | { kind: "idle" }
  | { kind: "create"; dirty: boolean }
  | { kind: "edit"; activityId: string; dirty: boolean }
  | { kind: "move"; activityId: string };

type ItineraryDayAccordionProps = {
  days: readonly TripDayViewModel[];
  tripId: string;
  tripDates: readonly string[];
  isOwner: boolean;
  initialExpandedDate: string | null;
};

function confirmDiscard(dirty: boolean): boolean {
  if (!dirty) {
    return true;
  }
  return window.confirm(ACTIVITY_MESSAGES.discardConfirm);
}

function isEditorActive(editor: EditorState): boolean {
  return editor.kind !== "idle";
}

function isEditorDirty(editor: EditorState): boolean {
  if (editor.kind === "create" || editor.kind === "edit") {
    return editor.dirty;
  }
  return false;
}

export function ItineraryDayAccordion({
  days,
  tripId,
  tripDates,
  isOwner,
  initialExpandedDate,
}: ItineraryDayAccordionProps) {
  const router = useRouter();
  const [expandedDate, setExpandedDate] = useState<string | null>(
    initialExpandedDate,
  );
  const [editor, setEditor] = useState<EditorState>({ kind: "idle" });
  const [actionsOpenId, setActionsOpenId] = useState<string | null>(null);

  const resetEditor = useCallback(() => {
    setEditor({ kind: "idle" });
    setActionsOpenId(null);
  }, []);

  const guardEditorChange = useCallback((): boolean => {
    if (!isEditorActive(editor)) {
      return true;
    }
    return confirmDiscard(isEditorDirty(editor));
  }, [editor]);

  const handleMutationSuccess = useCallback(
    (result: ActivityActionState) => {
      resetEditor();
      if (result.date) {
        setExpandedDate(result.date);
      }
      router.refresh();
    },
    [resetEditor, router],
  );

  function toggleDay(date: string) {
    if (expandedDate === date) {
      if (!guardEditorChange()) {
        return;
      }
      setExpandedDate(null);
      resetEditor();
      return;
    }

    if (!guardEditorChange()) {
      return;
    }

    setExpandedDate(date);
    resetEditor();
  }

  function startCreate() {
    if (!guardEditorChange()) {
      return;
    }
    setActionsOpenId(null);
    setEditor({ kind: "create", dirty: false });
  }

  function startEdit(activityId: string) {
    if (!guardEditorChange()) {
      return;
    }
    setActionsOpenId(null);
    setEditor({ kind: "edit", activityId, dirty: false });
  }

  function startMove(activityId: string) {
    if (!guardEditorChange()) {
      return;
    }
    setActionsOpenId(null);
    setEditor({ kind: "move", activityId });
  }

  function handleCancelEditor() {
    if (!confirmDiscard(isEditorDirty(editor))) {
      return;
    }
    resetEditor();
  }

  function toggleActions(activityId: string) {
    setActionsOpenId((current) => (current === activityId ? null : activityId));
  }

  function renderActivityItem(activity: ActivityViewModel) {
    if (editor.kind === "edit" && editor.activityId === activity.id) {
      return (
        <div key={activity.id} className={styles.inlineEditor}>
          <ActivityForm
            key={`edit-${activity.id}`}
            tripId={tripId}
            tripDates={tripDates}
            mode="edit"
            activityId={activity.id}
            lockDate
            defaultValues={toActivityFormValues(activity)}
            onCancel={handleCancelEditor}
            onSuccess={handleMutationSuccess}
            onDirtyChange={(dirty) =>
              setEditor({ kind: "edit", activityId: activity.id, dirty })
            }
          />
        </div>
      );
    }

    if (editor.kind === "move" && editor.activityId === activity.id) {
      return (
        <div key={activity.id} className={styles.inlineEditor}>
          <ActivityMovePanel
            tripId={tripId}
            activity={activity}
            tripDates={tripDates}
            onCancel={resetEditor}
            onSuccess={handleMutationSuccess}
          />
        </div>
      );
    }

    return (
      <ActivityRow
        key={activity.id}
        activity={activity}
        isOwner={isOwner}
        actions={
          isOwner ? (
            <ActivityRowActions
              tripId={tripId}
              activityId={activity.id}
              isOpen={actionsOpenId === activity.id}
              onToggle={() => toggleActions(activity.id)}
              onEdit={() => startEdit(activity.id)}
              onMove={() => startMove(activity.id)}
              onMutation={() => setActionsOpenId(null)}
            />
          ) : undefined
        }
      />
    );
  }

  return (
    <div className={styles.dayList}>
      {days.map((day) => {
        const isExpanded = expandedDate === day.date;
        const panelId = `day-panel-${day.date}`;

        return (
          <section
            key={day.date}
            id={`day-${day.date}`}
            className={styles.day}
            data-temporal={day.temporalState}
            data-expanded={isExpanded ? "true" : "false"}
          >
            <button
              type="button"
              className={styles.dayToggle}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              onClick={() => toggleDay(day.date)}
            >
              <IconChevron
                className={styles.dayChevron}
                aria-hidden
                data-expanded={isExpanded ? "true" : "false"}
              />
              <span className={styles.dayToggleCopy}>
                <span className={styles.dayToggleTitle}>
                  <span className={styles.dayNumber}>יום {day.dayNumber}</span>
                  <span className={styles.dayMetaInline}>
                    {day.weekdayLabel}, {day.dateLabel}
                  </span>
                  {day.temporalState === "today" ? (
                    <Badge tone="accent">היום</Badge>
                  ) : null}
                </span>
                <span className={styles.dayCount}>
                  {formatDayActivityCount(day.activities.length)}
                </span>
              </span>
            </button>

            {isExpanded ? (
              <div id={panelId} className={styles.dayPanel}>
                {day.activities.length > 0 ? (
                  <div className={styles.activityList}>
                    {day.activities.map((activity) =>
                      renderActivityItem(activity),
                    )}
                  </div>
                ) : (
                  <p className={styles.emptyDay}>אין פעילויות ביום זה</p>
                )}

                {editor.kind === "create" ? (
                  <div className={styles.inlineEditor}>
                    <ActivityForm
                      key={`create-${day.date}`}
                      tripId={tripId}
                      tripDates={tripDates}
                      mode="create"
                      lockDate
                      defaultValues={{
                        date: day.date,
                        title: "",
                        type: ACTIVITY_TYPES[0],
                        startTime: "",
                        endTime: "",
                        locationName: "",
                        address: "",
                        notes: "",
                      }}
                      onCancel={handleCancelEditor}
                      onSuccess={handleMutationSuccess}
                      onDirtyChange={(dirty) =>
                        setEditor({ kind: "create", dirty })
                      }
                    />
                  </div>
                ) : null}

                {isOwner && editor.kind === "idle" ? (
                  <div className={styles.dayAddAction}>
                    <button
                      type="button"
                      className={styles.dayAddButton}
                      onClick={startCreate}
                    >
                      + הוספת פעילות
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
