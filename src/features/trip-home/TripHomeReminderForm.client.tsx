"use client";

import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import styles from "./TripHomeRemindersManager.module.scss";

type TripHomeReminderFormFieldsProps = {
  startDate: string;
  endDate: string;
  defaultDate?: string;
  defaultTime?: string;
  defaultText?: string;
  dateId?: string;
  timeId?: string;
  textId?: string;
};

export function TripHomeReminderFormFields({
  startDate,
  endDate,
  defaultDate,
  defaultTime,
  defaultText,
  dateId = "reminder-date",
  timeId = "reminder-time",
  textId = "reminder-text",
}: TripHomeReminderFormFieldsProps) {
  return (
    <>
      <div className={styles.formRow}>
        <Field label="תאריך" htmlFor={dateId}>
          <Input
            id={dateId}
            name="date"
            type="date"
            min={startDate}
            max={endDate}
            defaultValue={defaultDate}
            required
          />
        </Field>
        <Field label="שעה" htmlFor={timeId}>
          <Input
            id={timeId}
            name="time"
            type="time"
            defaultValue={defaultTime}
            required
          />
        </Field>
      </div>
      <Field label="תוכן התזכורת" htmlFor={textId}>
        <Textarea
          id={textId}
          name="text"
          defaultValue={defaultText}
          rows={2}
          required
        />
      </Field>
    </>
  );
}
