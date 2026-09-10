"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Select } from "@/components/ui/Select/Select";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import {
  createTransportAction,
  updateTransportAction,
  type TransportActionState,
} from "./actions";
import { buildTransportDetailHref } from "./constants";
import { TRANSPORT_TIMEZONE_OPTIONS } from "./timezone-options";
import {
  TRAIN_CATEGORIES,
  TRAIN_CATEGORY_LABELS,
  TRANSPORT_TYPE_LABELS,
  type TransportType,
} from "./transport-types";
import type { TransportFormValues } from "./types";
import styles from "./TransportForm.module.scss";

const initialState: TransportActionState = {};

type TransportFormProps = {
  tripId: string;
  defaultValues: TransportFormValues;
  mode: "create" | "edit";
  transportId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  successHref?: string;
};

function TimezoneSelect({
  id,
  name,
  defaultValue,
  error,
}: {
  id: string;
  name: string;
  defaultValue: string;
  error?: string;
}) {
  return (
    <Field label="אזור זמן" htmlFor={id} error={error}>
      <Select
        id={id}
        name={name}
        defaultValue={defaultValue}
        required
        aria-invalid={error ? true : undefined}
      >
        {TRANSPORT_TIMEZONE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}

function TypeSpecificFields({
  type,
  defaultValues,
}: {
  type: TransportType;
  defaultValues: TransportFormValues;
}) {
  if (type === "flight") {
    return (
      <>
        <Field label="חברת תעופה" htmlFor="airline">
          <Input
            id="airline"
            name="airline"
            defaultValue={defaultValues.airline}
            maxLength={80}
          />
        </Field>
        <Field label="מספר טיסה" htmlFor="flightNumber">
          <Input
            id="flightNumber"
            name="flightNumber"
            defaultValue={defaultValues.flightNumber}
            maxLength={20}
          />
        </Field>
        <div className={styles.splitRow}>
          <Field label="טרמינל יציאה" htmlFor="departureTerminal">
            <Input
              id="departureTerminal"
              name="departureTerminal"
              defaultValue={defaultValues.departureTerminal}
              maxLength={40}
            />
          </Field>
          <Field label="טרמינל הגעה" htmlFor="arrivalTerminal">
            <Input
              id="arrivalTerminal"
              name="arrivalTerminal"
              defaultValue={defaultValues.arrivalTerminal}
              maxLength={40}
            />
          </Field>
        </div>
        <div className={styles.splitRow}>
          <Field label="שער" htmlFor="gate">
            <Input id="gate" name="gate" defaultValue={defaultValues.gate} maxLength={20} />
          </Field>
          <Field label="מושב" htmlFor="seat">
            <Input id="seat" name="seat" defaultValue={defaultValues.seat} maxLength={80} />
          </Field>
        </div>
      </>
    );
  }

  if (type === "train") {
    return (
      <>
        <Field label="סוג רכבת" htmlFor="trainCategory">
          <Select
            id="trainCategory"
            name="trainCategory"
            defaultValue={defaultValues.trainCategory}
          >
            <option value="">ללא</option>
            {TRAIN_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {TRAIN_CATEGORY_LABELS[category]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="שם שירות" htmlFor="serviceName">
          <Input
            id="serviceName"
            name="serviceName"
            defaultValue={defaultValues.serviceName}
            maxLength={80}
          />
        </Field>
        <div className={styles.splitRow}>
          <Field label="מספר רכבת" htmlFor="trainNumber">
            <Input
              id="trainNumber"
              name="trainNumber"
              defaultValue={defaultValues.trainNumber}
              maxLength={40}
            />
          </Field>
          <Field label="קרון" htmlFor="carNumber">
            <Input
              id="carNumber"
              name="carNumber"
              defaultValue={defaultValues.carNumber}
              maxLength={20}
            />
          </Field>
        </div>
        <Field label="מושבים" htmlFor="seats">
          <Input id="seats" name="seats" defaultValue={defaultValues.seats} maxLength={80} />
        </Field>
      </>
    );
  }

  return (
    <>
      <Field label="מפעיל / חברה" htmlFor="operator">
        <Input
          id="operator"
          name="operator"
          defaultValue={defaultValues.operator}
          maxLength={120}
        />
      </Field>
      <Field label="מספר שירות / רכב" htmlFor="serviceNumber">
        <Input
          id="serviceNumber"
          name="serviceNumber"
          defaultValue={defaultValues.serviceNumber}
          maxLength={40}
        />
      </Field>
      <Field label="פרטי רכב / שירות" htmlFor="vehicleOrServiceNotes">
        <Input
          id="vehicleOrServiceNotes"
          name="vehicleOrServiceNotes"
          defaultValue={defaultValues.vehicleOrServiceNotes}
          maxLength={200}
        />
      </Field>
    </>
  );
}

export function TransportForm({
  tripId,
  defaultValues,
  mode,
  transportId,
  onCancel,
  onSuccess,
  successHref,
}: TransportFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createTransportAction : updateTransportAction;
  const [state, formAction] = useActionState(action, initialState);
  const type = defaultValues.type;

  useEffect(() => {
    if (!state.ok) {
      return;
    }
    if (onSuccess) {
      onSuccess();
      router.refresh();
      return;
    }
    if (mode === "create" && state.transportId) {
      router.push(successHref ?? buildTransportDetailHref(tripId, state.transportId));
      return;
    }
    if (mode === "edit" && transportId) {
      router.push(buildTransportDetailHref(tripId, transportId));
    }
  }, [mode, onSuccess, router, state.ok, state.transportId, successHref, transportId, tripId]);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="tripId" value={tripId} />
      <input type="hidden" name="type" value={type} />
      {mode === "edit" && transportId ? (
        <input type="hidden" name="transportId" value={transportId} />
      ) : null}

      {state.error ? (
        <p className={styles.formError} role="alert">
          {state.error}
        </p>
      ) : null}

      <p className={styles.typeBadge}>{TRANSPORT_TYPE_LABELS[type]}</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>יציאה</h2>
        <Field
          label="מיקום"
          htmlFor="departureLocationName"
          error={state.fieldErrors?.["departure.locationName"]}
        >
          <Input
            id="departureLocationName"
            name="departureLocationName"
            defaultValue={defaultValues.departureLocationName}
            required
            maxLength={200}
            dir="auto"
          />
        </Field>
        <Field label="קוד (שדה / תחנה)" htmlFor="departureLocationCode">
          <Input
            id="departureLocationCode"
            name="departureLocationCode"
            defaultValue={defaultValues.departureLocationCode}
            maxLength={20}
            dir="auto"
          />
        </Field>
        <div className={styles.splitRow}>
          <Field
            label="תאריך"
            htmlFor="departureDate"
            error={state.fieldErrors?.["departure.date"]}
          >
            <Input
              id="departureDate"
              name="departureDate"
              type="date"
              defaultValue={defaultValues.departureDate}
              required
            />
          </Field>
          <Field
            label="שעה"
            htmlFor="departureTime"
            error={state.fieldErrors?.["departure.time"]}
          >
            <Input
              id="departureTime"
              name="departureTime"
              type="time"
              defaultValue={defaultValues.departureTime}
              required
            />
          </Field>
        </div>
        <TimezoneSelect
          id="departureTimezone"
          name="departureTimezone"
          defaultValue={defaultValues.departureTimezone}
          error={state.fieldErrors?.["departure.timezone"]}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>הגעה</h2>
        <Field
          label="מיקום"
          htmlFor="arrivalLocationName"
          error={state.fieldErrors?.["arrival.locationName"]}
        >
          <Input
            id="arrivalLocationName"
            name="arrivalLocationName"
            defaultValue={defaultValues.arrivalLocationName}
            required
            maxLength={200}
            dir="auto"
          />
        </Field>
        <Field label="קוד (שדה / תחנה)" htmlFor="arrivalLocationCode">
          <Input
            id="arrivalLocationCode"
            name="arrivalLocationCode"
            defaultValue={defaultValues.arrivalLocationCode}
            maxLength={20}
            dir="auto"
          />
        </Field>
        <div className={styles.splitRow}>
          <Field
            label="תאריך"
            htmlFor="arrivalDate"
            error={state.fieldErrors?.["arrival.date"]}
          >
            <Input
              id="arrivalDate"
              name="arrivalDate"
              type="date"
              defaultValue={defaultValues.arrivalDate}
              required
            />
          </Field>
          <Field
            label="שעה"
            htmlFor="arrivalTime"
            error={state.fieldErrors?.["arrival.time"]}
          >
            <Input
              id="arrivalTime"
              name="arrivalTime"
              type="time"
              defaultValue={defaultValues.arrivalTime}
              required
            />
          </Field>
        </div>
        <TimezoneSelect
          id="arrivalTimezone"
          name="arrivalTimezone"
          defaultValue={defaultValues.arrivalTimezone}
          error={state.fieldErrors?.["arrival.timezone"]}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>פרטים</h2>
        <TypeSpecificFields type={type} defaultValues={defaultValues} />
        <Field label="מספר הזמנה" htmlFor="bookingReference">
          <Input
            id="bookingReference"
            name="bookingReference"
            defaultValue={defaultValues.bookingReference}
            maxLength={80}
          />
        </Field>
        <Field label="הערות" htmlFor="notes">
          <Textarea
            id="notes"
            name="notes"
            defaultValue={defaultValues.notes}
            maxLength={2000}
            dir="auto"
          />
        </Field>
      </section>

      <div className={styles.actions}>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            ביטול
          </Button>
        ) : null}
        <AuthSubmitButton>{mode === "create" ? "שמירה" : "עדכון"}</AuthSubmitButton>
      </div>
    </form>
  );
}
