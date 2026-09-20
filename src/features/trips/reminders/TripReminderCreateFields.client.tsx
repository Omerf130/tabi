"use client";

import { useTranslations } from "next-intl";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { TripReminderBrowserTimeZoneField } from "./TripReminderBrowserTimeZoneField.client";
import styles from "./TripReminderSettings.module.scss";

type TripReminderCreateFieldsProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  defaultDate?: string;
  lockDate?: boolean;
  idPrefix?: string;
  rows?: number;
};

export function TripReminderCreateFields({
  tripId,
  startDate,
  endDate,
  defaultDate,
  lockDate = false,
  idPrefix = "reminder",
  rows = 2,
}: TripReminderCreateFieldsProps) {
  const t = useTranslations("TripReminders");
  const tCommon = useTranslations("Common");

  return (
    <>
      <input type="hidden" name="tripId" value={tripId} />
      <TripReminderBrowserTimeZoneField />
      {lockDate && defaultDate ? (
        <input type="hidden" name="date" value={defaultDate} />
      ) : null}
      <div className={styles.formRow}>
        {!lockDate ? (
          <Field label={tCommon("date")} htmlFor={`${idPrefix}-date`}>
            <Input
              id={`${idPrefix}-date`}
              name="date"
              type="date"
              min={startDate}
              max={endDate}
              defaultValue={defaultDate}
              required
            />
          </Field>
        ) : null}
        <Field label={tCommon("time")} htmlFor={`${idPrefix}-time`}>
          <Input id={`${idPrefix}-time`} name="time" type="time" required />
        </Field>
      </div>
      <Field label={t("content")} htmlFor={`${idPrefix}-text`}>
        <Textarea id={`${idPrefix}-text`} name="text" rows={rows} required />
      </Field>
    </>
  );
}
