"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconBell } from "@/components/ui/icons";
import {
  completeTripReminderAction,
  deleteTripReminderAction,
} from "@/features/trips/reminders/actions";
import type { TripReminderViewModel } from "@/features/trips/reminders/types";
import reminderStyles from "@/features/trips/reminders/TripReminderSettings.module.scss";
import styles from "./DayPage.module.scss";

type ReminderRowProps = {
  tripId: string;
  reminder: TripReminderViewModel;
  onEdit: (reminderId: string) => void;
};

function ReminderRow({ tripId, reminder, onEdit }: ReminderRowProps) {
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [, startTransition] = useTransition();

  function runMutation(
    action: (
      prev: Record<string, never>,
      formData: FormData,
    ) => ReturnType<typeof completeTripReminderAction>,
  ) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("tripId", tripId);
      formData.set("reminderId", reminder.id);
      const result = await action({}, formData);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <li
      className={reminderStyles.item}
      data-completed={reminder.isCompleted ? "true" : "false"}
    >
      <div className={reminderStyles.itemBody}>
        <p className={reminderStyles.itemMeta}>{reminder.time}</p>
        <p className={reminderStyles.itemText}>{reminder.text}</p>
      </div>
      <div className={reminderStyles.rowActions}>
        {!reminder.isCompleted ? (
          <Button
            type="button"
            variant="ghost"
            size="compact"
            onClick={() => runMutation(completeTripReminderAction)}
          >
            {tCommon("markComplete")}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="compact"
          onClick={() => onEdit(reminder.id)}
        >
          {tCommon("edit")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="compact"
          onClick={() => runMutation(deleteTripReminderAction)}
        >
          {tCommon("delete")}
        </Button>
      </div>
    </li>
  );
}

type DayRemindersSectionProps = {
  tripId: string;
  date: string;
  incompleteReminders: TripReminderViewModel[];
  completedReminders: TripReminderViewModel[];
  showCreateAction: boolean;
  onCreateRequest: () => void;
  onEditReminder: (reminderId: string) => void;
};

export function DayRemindersSection({
  incompleteReminders,
  completedReminders,
  showCreateAction,
  onCreateRequest,
  onEditReminder,
  tripId,
}: DayRemindersSectionProps) {
  const t = useTranslations("Itinerary");

  return (
    <section className={styles.section} aria-labelledby="day-reminders-title">
      <div className={styles.sectionHeader}>
        <h2 id="day-reminders-title" className={styles.sectionTitle}>
          {t("dayRemindersTitle")}
        </h2>
        <p className={styles.sectionHint}>{t("dayRemindersHint")}</p>
      </div>

      {showCreateAction ? (
        <Button type="button" variant="ghost" onClick={onCreateRequest}>
          {t("dayRemindersAdd")}
        </Button>
      ) : null}

      {incompleteReminders.length > 0 ? (
        <ul className={reminderStyles.list}>
          {incompleteReminders.map((reminder) => (
            <ReminderRow
              key={reminder.id}
              tripId={tripId}
              reminder={reminder}
              onEdit={onEditReminder}
            />
          ))}
        </ul>
      ) : (
        <EmptyState
          variant="inline"
          className={styles.dayRemindersEmpty}
          visual={{ motif: "generic", icon: <IconBell aria-hidden /> }}
          title={t("dayRemindersEmpty")}
        />
      )}

      {completedReminders.length > 0 ? (
        <details className={styles.completedDetails}>
          <summary>{t("dayRemindersCompleted", { count: completedReminders.length })}</summary>
          <ul className={reminderStyles.list}>
            {completedReminders.map((reminder) => (
              <ReminderRow
                key={reminder.id}
                tripId={tripId}
                reminder={reminder}
                onEdit={onEditReminder}
              />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
