"use client";

import {
  useActionState,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import { useRouter } from "next/navigation";
import { IconBack, IconChevron } from "@/components/ui/icons";
import {
  completeTripReminderAction,
  createTripReminderAction,
  deleteTripReminderAction,
  updateTripReminderAction,
  type TripReminderActionState,
} from "@/features/trips/reminders/actions";
import {
  getReminderManagerEmptyMessage,
  groupRemindersForTab,
  type ReminderManagerTab,
} from "@/features/trips/reminders/filter-trip-home-reminders";
import type { TripReminderViewModel } from "@/features/trips/reminders/types";
import { TripHomeReminderFormFields } from "./TripHomeReminderForm.client";
import type { TripHomeRemindersManagerData } from "./types";
import styles from "./TripHomeRemindersManager.module.scss";

const initialState: TripReminderActionState = {};

type ManagerView = "list" | "create" | "edit";

type TripHomeRemindersManagerProps = {
  isOpen: boolean;
  onClose: () => void;
  managerData: TripHomeRemindersManagerData;
  initialTab: ReminderManagerTab;
};

const TABS: Array<{ id: ReminderManagerTab; label: string }> = [
  { id: "today", label: "היום" },
  { id: "upcoming", label: "בקרוב" },
  { id: "all", label: "הכל" },
  { id: "completed", label: "הושלמו" },
];

function ReminderCompleteButton({
  tripId,
  reminderId,
  onCompleted,
}: {
  tripId: string;
  reminderId: string;
  onCompleted: () => void;
}) {
  const [state, action] = useActionState(completeTripReminderAction, initialState);

  useEffect(() => {
    if (state.ok) {
      onCompleted();
    }
  }, [state.ok, onCompleted]);

  return (
    <form action={action}>
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="reminderId" value={reminderId} />
      <button
        type="submit"
        className={styles.completeButton}
        aria-label="סימון כהושלם"
      />
    </form>
  );
}

function ReminderListView({
  managerData,
  activeTab,
  onTabChange,
  onCreate,
  onEdit,
  onComplete,
}: {
  managerData: TripHomeRemindersManagerData;
  activeTab: ReminderManagerTab;
  onTabChange: (tab: ReminderManagerTab) => void;
  onCreate: () => void;
  onEdit: (reminder: TripReminderViewModel) => void;
  onComplete: () => void;
}) {
  const groups = useMemo(
    () =>
      groupRemindersForTab(
        managerData.reminders,
        activeTab,
        managerData.currentTripDate,
      ),
    [managerData.reminders, activeTab, managerData.currentTripDate],
  );

  const emptyMessage = getReminderManagerEmptyMessage(activeTab);

  return (
    <>
      <div className={styles.tabBar} role="tablist" aria-label="סינון תזכורות">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={styles.tabButton}
            data-active={activeTab === tab.id ? "true" : undefined}
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.managerBody}>
        {groups.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>{emptyMessage}</p>
            {activeTab !== "completed" ? (
              <button type="button" className={styles.emptyAction} onClick={onCreate}>
                + תזכורת חדשה
              </button>
            ) : null}
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.date} className={styles.dateGroup}>
              {activeTab !== "today" ? (
                <h3 className={styles.dateHeading}>{group.heading}</h3>
              ) : null}
              <ul className={styles.reminderList}>
                {group.reminders.map((reminder) => (
                  <li
                    key={reminder.id}
                    className={styles.reminderRow}
                    data-completed={reminder.isCompleted ? "true" : undefined}
                  >
                    {!reminder.isCompleted ? (
                      <ReminderCompleteButton
                        tripId={managerData.tripId}
                        reminderId={reminder.id}
                        onCompleted={onComplete}
                      />
                    ) : (
                      <span className={styles.completeButton} aria-hidden />
                    )}
                    <button
                      type="button"
                      className={styles.reminderMainButton}
                      onClick={() => onEdit(reminder)}
                    >
                      <span className={styles.reminderText} dir="auto">
                        {reminder.text}
                      </span>
                      <span className={styles.reminderTime}>{reminder.time}</span>
                      <IconChevron className={styles.reminderChevron} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}

function ReminderFormView({
  mode,
  managerData,
  reminder,
  titleId,
  onBack,
  onSaved,
}: {
  mode: "create" | "edit";
  managerData: TripHomeRemindersManagerData;
  reminder?: TripReminderViewModel;
  titleId: string;
  onBack: () => void;
  onSaved: () => void;
}) {
  const formId = useId();
  const [createState, createFormAction] = useActionState(
    createTripReminderAction,
    initialState,
  );
  const [updateState, updateFormAction] = useActionState(
    updateTripReminderAction,
    initialState,
  );
  const [deleteState, deleteFormAction] = useActionState(
    deleteTripReminderAction,
    initialState,
  );

  const state = mode === "create" ? createState : updateState;

  useEffect(() => {
    if (createState.ok || updateState.ok || deleteState.ok) {
      onSaved();
    }
  }, [createState.ok, updateState.ok, deleteState.ok, onSaved]);

  return (
    <>
      <header className={`${styles.managerHeader} ${styles.managerHeaderForm}`}>
        <button
          type="button"
          className={styles.managerIconButton}
          onClick={onBack}
          aria-label="חזרה לרשימה"
        >
          <IconBack aria-hidden />
        </button>
        <h2 id={titleId} className={styles.managerTitle}>
          {mode === "create" ? "תזכורת חדשה" : "עריכת תזכורת"}
        </h2>
        <button type="submit" form={formId} className={styles.managerSaveButton}>
          שמור
        </button>
      </header>

      <div className={styles.managerBody}>
        <form
          id={formId}
          action={mode === "create" ? createFormAction : updateFormAction}
          className={styles.formBody}
        >
          <input type="hidden" name="tripId" value={managerData.tripId} />
          {mode === "edit" && reminder ? (
            <input type="hidden" name="reminderId" value={reminder.id} />
          ) : null}
          <TripHomeReminderFormFields
            startDate={managerData.startDate}
            endDate={managerData.endDate}
            defaultDate={mode === "edit" ? reminder?.date : managerData.currentTripDate}
            defaultTime={mode === "edit" ? reminder?.time : undefined}
            defaultText={mode === "edit" ? reminder?.text : undefined}
            dateId={`${formId}-date`}
            timeId={`${formId}-time`}
            textId={`${formId}-text`}
          />
          {state.error ? (
            <p className={styles.formError} role="alert">
              {state.error}
            </p>
          ) : null}
        </form>

        {mode === "edit" && reminder ? (
          <form action={deleteFormAction}>
            <input type="hidden" name="tripId" value={managerData.tripId} />
            <input type="hidden" name="reminderId" value={reminder.id} />
            <button type="submit" className={styles.deleteButton}>
              מחיקת תזכורת
            </button>
            {deleteState.error ? (
              <p className={styles.formError} role="alert">
                {deleteState.error}
              </p>
            ) : null}
          </form>
        ) : null}
      </div>
    </>
  );
}

export function TripHomeRemindersManager({
  isOpen,
  onClose,
  managerData,
  initialTab,
}: TripHomeRemindersManagerProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [view, setView] = useState<ManagerView>("list");
  const [activeTab, setActiveTab] = useState<ReminderManagerTab>(initialTab);
  const [selectedReminder, setSelectedReminder] = useState<TripReminderViewModel | null>(
    null,
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) {
        dialog.showModal();
      }
      document.body.style.overflow = "hidden";
    } else if (dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
      triggerRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedReminder(null);
  };

  const handleSaved = () => {
    router.refresh();
    setView("list");
    setSelectedReminder(null);
  };

  const handleComplete = () => {
    router.refresh();
  };

  const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target !== dialogRef.current || view !== "list") {
      return;
    }
    onClose();
  };

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (view !== "list") {
      handleBackToList();
      return;
    }
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.managerDialog}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleDialogClick}
    >
      <div className={styles.managerShell}>
        {view === "list" ? (
          <>
            <header className={styles.managerHeader}>
              <button
                type="button"
                className={styles.managerIconButton}
                onClick={handleClose}
                aria-label="סגירה"
              >
                ×
              </button>
              <h2 id={titleId} className={styles.managerTitle}>
                תזכורות
              </h2>
              <button
                type="button"
                className={styles.managerIconButton}
                onClick={() => setView("create")}
                aria-label="תזכורת חדשה"
              >
                +
              </button>
            </header>
            <ReminderListView
              managerData={managerData}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onCreate={() => setView("create")}
              onEdit={(reminder) => {
                setSelectedReminder(reminder);
                setView("edit");
              }}
              onComplete={handleComplete}
            />
          </>
        ) : (
          <ReminderFormView
            mode={view}
            managerData={managerData}
            reminder={selectedReminder ?? undefined}
            titleId={titleId}
            onBack={handleBackToList}
            onSaved={handleSaved}
          />
        )}
      </div>
    </dialog>
  );
}
