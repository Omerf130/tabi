"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { buildTransportJourneyPreview } from "@/features/itinerary/build-transport-journey-preview";
import overlayStyles from "@/features/itinerary/AddItemFlow.module.scss";
import { TransportTypeChooser } from "@/features/itinerary/TransportTypeChooser.client";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Select } from "@/components/ui/Select/Select";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import type { CurrencyOption } from "@/features/currency/types";
import { EntityCostFields } from "@/features/finance/EntityCostFields.client";
import type { EntityLinkedCostViewModel } from "@/features/finance/types";
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
  TRANSPORT_TYPE_SINGULAR_LABELS,
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
  financeBaseCurrency?: string;
  currencies?: readonly CurrencyOption[];
  linkedCost?: EntityLinkedCostViewModel | null;
  overlayNavigation?: boolean;
  plannerPresentation?: boolean;
  transportType?: TransportType;
  onTransportTypeChange?: (transportType: TransportType) => void;
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
  financeBaseCurrency = "ILS",
  currencies = [],
  linkedCost,
  overlayNavigation = false,
  plannerPresentation = false,
  transportType,
  onTransportTypeChange,
}: TransportFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createTransportAction : updateTransportAction;
  const [state, formAction] = useActionState(action, initialState);
  const type = defaultValues.type;
  const [journeyPreview, setJourneyPreview] = useState(() =>
    buildTransportJourneyPreview({
      departureLocationName: defaultValues.departureLocationName,
      arrivalLocationName: defaultValues.arrivalLocationName,
      departureTime: defaultValues.departureTime,
      arrivalTime: defaultValues.arrivalTime,
    }),
  );

  function syncJourneyPreview(form: HTMLFormElement) {
    setJourneyPreview(
      buildTransportJourneyPreview({
        departureLocationName: String(
          new FormData(form).get("departureLocationName") ?? "",
        ),
        arrivalLocationName: String(
          new FormData(form).get("arrivalLocationName") ?? "",
        ),
        departureTime: String(new FormData(form).get("departureTime") ?? ""),
        arrivalTime: String(new FormData(form).get("arrivalTime") ?? ""),
      }),
    );
  }

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

  if (plannerPresentation) {
    const departureLocationError = state.fieldErrors?.["departure.locationName"];
    const arrivalLocationError = state.fieldErrors?.["arrival.locationName"];

    return (
      <form
        action={formAction}
        className={overlayStyles.transportOverlayForm}
        onInput={(event) => syncJourneyPreview(event.currentTarget)}
        onChange={(event) => syncJourneyPreview(event.currentTarget)}
      >
        <input type="hidden" name="tripId" value={tripId} />
        <input type="hidden" name="type" value={type} />
        {mode === "edit" && transportId ? (
          <input type="hidden" name="transportId" value={transportId} />
        ) : null}

        {state.error ? (
          <p className={overlayStyles.overlayError} role="alert">
            {state.error}
          </p>
        ) : null}

        {mode === "create" && onTransportTypeChange ? (
          <TransportTypeChooser
            selectedType={transportType ?? type}
            onSelect={onTransportTypeChange}
          />
        ) : (
          <p className={styles.typeBadge}>{TRANSPORT_TYPE_SINGULAR_LABELS[type]}</p>
        )}

        <section aria-labelledby="transport-route-label">
          <h2 id="transport-route-label" className={overlayStyles.blockLabel}>
            מסלול
          </h2>
          <div className={overlayStyles.routePath}>
            <div className={overlayStyles.routeStop}>
              <span className={overlayStyles.routeDot} aria-hidden />
              <div className={overlayStyles.routeStopFields}>
                <label className={overlayStyles.pairLabel} htmlFor="departureLocationName">
                  מאיפה
                </label>
                <input
                  id="departureLocationName"
                  className={overlayStyles.blockInput}
                  name="departureLocationName"
                  defaultValue={defaultValues.departureLocationName}
                  required
                  maxLength={200}
                  dir="auto"
                  placeholder="Tokyo"
                  aria-invalid={departureLocationError ? true : undefined}
                />
                {departureLocationError ? (
                  <p className={overlayStyles.overlayError} role="alert">
                    {departureLocationError}
                  </p>
                ) : null}
              </div>
            </div>
            <div className={overlayStyles.routeLine} aria-hidden />
            <div className={overlayStyles.routeStop}>
              <span className={overlayStyles.routeDot} data-kind="destination" aria-hidden />
              <div className={overlayStyles.routeStopFields}>
                <label className={overlayStyles.pairLabel} htmlFor="arrivalLocationName">
                  לאן
                </label>
                <input
                  id="arrivalLocationName"
                  className={overlayStyles.blockInput}
                  name="arrivalLocationName"
                  defaultValue={defaultValues.arrivalLocationName}
                  required
                  maxLength={200}
                  dir="auto"
                  placeholder="Kyoto"
                  aria-invalid={arrivalLocationError ? true : undefined}
                />
                {arrivalLocationError ? (
                  <p className={overlayStyles.overlayError} role="alert">
                    {arrivalLocationError}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {journeyPreview ? (
          <div className={overlayStyles.journeyPreview} aria-live="polite">
            <p className={overlayStyles.journeyRoute}>{journeyPreview.routeLabel}</p>
            {journeyPreview.timeLabel ? (
              <p className={overlayStyles.journeyTime}>{journeyPreview.timeLabel}</p>
            ) : null}
          </div>
        ) : null}

        <section className={overlayStyles.timeSection} aria-labelledby="transport-times-label">
          <h2 id="transport-times-label" className={overlayStyles.blockLabel}>
            זמנים
          </h2>
          <p className={overlayStyles.timeLegLabel}>יציאה</p>
          <div className={overlayStyles.pairRow}>
            <div className={overlayStyles.pairCell}>
              <label className={overlayStyles.pairLabel} htmlFor="departureDate">
                תאריך
              </label>
              <input
                id="departureDate"
                className={overlayStyles.blockInput}
                name="departureDate"
                type="date"
                defaultValue={defaultValues.departureDate}
                required
                aria-invalid={state.fieldErrors?.["departure.date"] ? true : undefined}
              />
            </div>
            <div className={overlayStyles.pairCell}>
              <label className={overlayStyles.pairLabel} htmlFor="departureTime">
                שעה
              </label>
              <input
                id="departureTime"
                className={overlayStyles.blockInput}
                name="departureTime"
                type="time"
                defaultValue={defaultValues.departureTime}
                required
                aria-invalid={state.fieldErrors?.["departure.time"] ? true : undefined}
              />
            </div>
          </div>
          <TimezoneSelect
            id="departureTimezone"
            name="departureTimezone"
            defaultValue={defaultValues.departureTimezone}
            error={state.fieldErrors?.["departure.timezone"]}
          />
          <p className={overlayStyles.timeLegLabel}>הגעה</p>
          <div className={overlayStyles.pairRow}>
            <div className={overlayStyles.pairCell}>
              <label className={overlayStyles.pairLabel} htmlFor="arrivalDate">
                תאריך
              </label>
              <input
                id="arrivalDate"
                className={overlayStyles.blockInput}
                name="arrivalDate"
                type="date"
                defaultValue={defaultValues.arrivalDate}
                required
                aria-invalid={state.fieldErrors?.["arrival.date"] ? true : undefined}
              />
            </div>
            <div className={overlayStyles.pairCell}>
              <label className={overlayStyles.pairLabel} htmlFor="arrivalTime">
                שעה
              </label>
              <input
                id="arrivalTime"
                className={overlayStyles.blockInput}
                name="arrivalTime"
                type="time"
                defaultValue={defaultValues.arrivalTime}
                required
                aria-invalid={state.fieldErrors?.["arrival.time"] ? true : undefined}
              />
            </div>
          </div>
          <TimezoneSelect
            id="arrivalTimezone"
            name="arrivalTimezone"
            defaultValue={defaultValues.arrivalTimezone}
            error={state.fieldErrors?.["arrival.timezone"]}
          />
        </section>

        <details className={overlayStyles.compactDetails}>
          <summary className={overlayStyles.compactDetailsSummary}>פרטים נוספים</summary>
          <div className={overlayStyles.compactDetailsBody}>
            <Field label="קוד יציאה (שדה / תחנה)" htmlFor="departureLocationCode">
              <Input
                id="departureLocationCode"
                name="departureLocationCode"
                defaultValue={defaultValues.departureLocationCode}
                maxLength={20}
                dir="auto"
              />
            </Field>
            <Field label="קוד הגעה (שדה / תחנה)" htmlFor="arrivalLocationCode">
              <Input
                id="arrivalLocationCode"
                name="arrivalLocationCode"
                defaultValue={defaultValues.arrivalLocationCode}
                maxLength={20}
                dir="auto"
              />
            </Field>
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
                rows={2}
              />
            </Field>
          </div>
        </details>

        {currencies.length > 0 ? (
          <EntityCostFields
            baseCurrency={financeBaseCurrency}
            currencies={currencies}
            linkedCost={linkedCost}
            showHelper={false}
            idPrefix={`transport-${transportId ?? "create"}`}
          />
        ) : null}

        <div className={overlayStyles.overlayFooter}>
          <AuthSubmitButton>
            {mode === "create" ? "הוספת תחבורה" : "שמירת שינויים"}
          </AuthSubmitButton>
        </div>
      </form>
    );
  }

  return (
    <form
      action={formAction}
      className={styles.form}
      onInput={(event) => syncJourneyPreview(event.currentTarget)}
      onChange={(event) => syncJourneyPreview(event.currentTarget)}
    >
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

      {journeyPreview ? (
        <div className={overlayStyles.journeyPreview} aria-live="polite">
          <p className={overlayStyles.journeyRoute}>{journeyPreview.routeLabel}</p>
          {journeyPreview.timeLabel ? (
            <p className={overlayStyles.journeyTime}>{journeyPreview.timeLabel}</p>
          ) : null}
        </div>
      ) : null}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>מאיפה</h2>
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
        <h2 className={styles.sectionTitle}>לאן</h2>
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

      {currencies.length > 0 ? (
        <EntityCostFields
          baseCurrency={financeBaseCurrency}
          currencies={currencies}
          linkedCost={linkedCost}
          showHelper={!plannerPresentation}
          idPrefix={`transport-${transportId ?? "create"}`}
        />
      ) : null}

      <div className={styles.actions}>
        {onCancel && !overlayNavigation ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            ביטול
          </Button>
        ) : null}
        <AuthSubmitButton>
          {mode === "create"
            ? plannerPresentation
              ? "הוספת תחבורה"
              : "שמירה"
            : "שמירת שינויים"}
        </AuthSubmitButton>
      </div>
    </form>
  );
}
