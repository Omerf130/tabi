"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import {
  createTrainCategoryLabelResolver,
  createTransportTypeSingularLabelResolver,
} from "./transport-labels";
import { TRAIN_CATEGORIES, type TransportType } from "./transport-types";
import type { TransportFormValues } from "./types";
import { QuickAddPinnedFields } from "@/features/quick-add/QuickAddPinnedFields.client";
import {
  mergePlannerPinnedFormClass,
  resolvePinnedPlannerFooterClass,
} from "@/features/quick-add/quick-add-pinned-form";
import styles from "./TransportForm.module.scss";

const initialState: TransportActionState = {};

type TransportFormProps = {
  tripId: string;
  destinationCountryCode?: string | null;
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
  pinnedActionFooter?: boolean;
};

function HiddenTimezoneFields({
  departureTimezone,
  arrivalTimezone,
  departureError,
  arrivalError,
}: {
  departureTimezone: string;
  arrivalTimezone: string;
  departureError?: string;
  arrivalError?: string;
}) {
  return (
    <>
      <input type="hidden" name="departureTimezone" defaultValue={departureTimezone} />
      <input type="hidden" name="arrivalTimezone" defaultValue={arrivalTimezone} />
      {departureError ? (
        <p className={styles.formError} role="alert">
          {departureError}
        </p>
      ) : null}
      {arrivalError ? (
        <p className={styles.formError} role="alert">
          {arrivalError}
        </p>
      ) : null}
    </>
  );
}

function TypeSpecificFields({
  type,
  defaultValues,
  t,
  trainCategoryLabel,
}: {
  type: TransportType;
  defaultValues: TransportFormValues;
  t: ReturnType<typeof useTranslations<"Transport">>;
  trainCategoryLabel: ReturnType<typeof createTrainCategoryLabelResolver>;
}) {
  if (type === "flight") {
    return (
      <>
        <div className={styles.splitRow}>
          <Field label={t("airline")} htmlFor="airline">
            <Input
              id="airline"
              name="airline"
              defaultValue={defaultValues.airline}
              maxLength={80}
            />
          </Field>
          <Field label={t("flightNumber")} htmlFor="flightNumber">
            <Input
              id="flightNumber"
              name="flightNumber"
              defaultValue={defaultValues.flightNumber}
              maxLength={20}
            />
          </Field>
        </div>
        <div className={styles.splitRow}>
          <Field label={t("departureTerminal")} htmlFor="departureTerminal">
            <Input
              id="departureTerminal"
              name="departureTerminal"
              defaultValue={defaultValues.departureTerminal}
              maxLength={40}
            />
          </Field>
          <Field label={t("arrivalTerminal")} htmlFor="arrivalTerminal">
            <Input
              id="arrivalTerminal"
              name="arrivalTerminal"
              defaultValue={defaultValues.arrivalTerminal}
              maxLength={40}
            />
          </Field>
        </div>
        <div className={styles.splitRow}>
          <Field label={t("gate")} htmlFor="gate">
            <Input id="gate" name="gate" defaultValue={defaultValues.gate} maxLength={20} />
          </Field>
          <Field label={t("seat")} htmlFor="seat">
            <Input id="seat" name="seat" defaultValue={defaultValues.seat} maxLength={80} />
          </Field>
        </div>
      </>
    );
  }

  if (type === "train") {
    return (
      <>
        <Field label={t("trainType")} htmlFor="trainCategory">
          <Select
            id="trainCategory"
            name="trainCategory"
            defaultValue={defaultValues.trainCategory}
          >
            <option value="">{t("noneOption")}</option>
            {TRAIN_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {trainCategoryLabel(category)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("serviceName")} htmlFor="serviceName">
          <Input
            id="serviceName"
            name="serviceName"
            defaultValue={defaultValues.serviceName}
            maxLength={80}
          />
        </Field>
        <div className={styles.splitRow}>
          <Field label={t("trainNumber")} htmlFor="trainNumber">
            <Input
              id="trainNumber"
              name="trainNumber"
              defaultValue={defaultValues.trainNumber}
              maxLength={40}
            />
          </Field>
          <Field label={t("carNumber")} htmlFor="carNumber">
            <Input
              id="carNumber"
              name="carNumber"
              defaultValue={defaultValues.carNumber}
              maxLength={20}
            />
          </Field>
        </div>
        <Field label={t("seats")} htmlFor="seats">
          <Input id="seats" name="seats" defaultValue={defaultValues.seats} maxLength={80} />
        </Field>
      </>
    );
  }

  return (
    <>
      <Field label={t("operator")} htmlFor="operator">
        <Input
          id="operator"
          name="operator"
          defaultValue={defaultValues.operator}
          maxLength={120}
        />
      </Field>
      <Field label={t("serviceNumber")} htmlFor="serviceNumber">
        <Input
          id="serviceNumber"
          name="serviceNumber"
          defaultValue={defaultValues.serviceNumber}
          maxLength={40}
        />
      </Field>
      <Field label={t("vehicleNotes")} htmlFor="vehicleOrServiceNotes">
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
  destinationCountryCode,
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
  pinnedActionFooter = false,
}: TransportFormProps) {
  const t = useTranslations("Transport");
  const tCommon = useTranslations("Common");
  const tErrors = useTranslations("Transport.errors");
  const typeSingularLabel = createTransportTypeSingularLabelResolver(t);
  const trainCategoryLabel = createTrainCategoryLabelResolver(t, destinationCountryCode);
  const router = useRouter();
  const action = mode === "create" ? createTransportAction : updateTransportAction;
  const [state, formAction] = useActionState(action, initialState);
  const [selectedType, setSelectedType] = useState(defaultValues.type);
  const activeType = mode === "create" ? selectedType : defaultValues.type;
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

    const footerClass = resolvePinnedPlannerFooterClass(
      pinnedActionFooter,
      overlayStyles.overlayFooter,
    );

    return (
      <form
        action={formAction}
        className={mergePlannerPinnedFormClass(
          overlayStyles.transportOverlayForm,
          pinnedActionFooter,
        )}
        onInput={(event) => syncJourneyPreview(event.currentTarget)}
        onChange={(event) => syncJourneyPreview(event.currentTarget)}
      >
        <QuickAddPinnedFields pinnedActionFooter={pinnedActionFooter}>
        <input type="hidden" name="tripId" value={tripId} />
        <input type="hidden" name="type" value={activeType} />
        {mode === "edit" && transportId ? (
          <input type="hidden" name="transportId" value={transportId} />
        ) : null}

        {state.errorCode ? (
          <p className={overlayStyles.overlayError} role="alert">
            {tErrors(state.errorCode)}
          </p>
        ) : null}

        {mode === "create" && onTransportTypeChange ? (
          <TransportTypeChooser
            selectedType={transportType ?? activeType}
            onSelect={onTransportTypeChange}
          />
        ) : (
          <p className={styles.typeBadge}>{typeSingularLabel(activeType)}</p>
        )}

        <section aria-labelledby="transport-route-label">
          <h2 id="transport-route-label" className={overlayStyles.blockLabel}>
            {t("route")}
          </h2>
          <div className={styles.routeRow}>
            <Field
              label={t("from")}
              htmlFor="departureLocationName"
              error={departureLocationError}
            >
              <Input
                id="departureLocationName"
                name="departureLocationName"
                defaultValue={defaultValues.departureLocationName}
                required
                maxLength={200}
                dir="auto"
                placeholder={t("departureLocationPlaceholder")}
              />
            </Field>
            <span className={styles.routeIndicator} aria-hidden>
              ↔
            </span>
            <Field label={t("to")} htmlFor="arrivalLocationName" error={arrivalLocationError}>
              <Input
                id="arrivalLocationName"
                name="arrivalLocationName"
                defaultValue={defaultValues.arrivalLocationName}
                required
                maxLength={200}
                dir="auto"
                placeholder={t("arrivalLocationPlaceholder")}
              />
            </Field>
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
            {t("times")}
          </h2>
          <p className={styles.legLabel}>{t("departure")}</p>
          <div className={styles.splitRow}>
            <Field
              label={tCommon("date")}
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
              label={tCommon("time")}
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
          <p className={styles.legLabel}>{t("arrival")}</p>
          <div className={styles.splitRow}>
            <Field
              label={tCommon("date")}
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
              label={tCommon("time")}
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
          <HiddenTimezoneFields
            departureTimezone={defaultValues.departureTimezone}
            arrivalTimezone={defaultValues.arrivalTimezone}
            departureError={state.fieldErrors?.["departure.timezone"]}
            arrivalError={state.fieldErrors?.["arrival.timezone"]}
          />
        </section>

        <details className={overlayStyles.compactDetails}>
          <summary className={overlayStyles.compactDetailsSummary}>{t("moreDetails")}</summary>
          <div className={overlayStyles.compactDetailsBody}>
            <Field label={t("departureLocationCode")} htmlFor="departureLocationCode">
              <Input
                id="departureLocationCode"
                name="departureLocationCode"
                defaultValue={defaultValues.departureLocationCode}
                maxLength={20}
                dir="auto"
              />
            </Field>
            <Field label={t("arrivalLocationCode")} htmlFor="arrivalLocationCode">
              <Input
                id="arrivalLocationCode"
                name="arrivalLocationCode"
                defaultValue={defaultValues.arrivalLocationCode}
                maxLength={20}
                dir="auto"
              />
            </Field>
            <TypeSpecificFields
              type={activeType}
              defaultValues={defaultValues}
              t={t}
              trainCategoryLabel={trainCategoryLabel}
            />
            <Field label={t("bookingReference")} htmlFor="bookingReference">
              <Input
                id="bookingReference"
                name="bookingReference"
                defaultValue={defaultValues.bookingReference}
                maxLength={80}
              />
            </Field>
            <Field label={tCommon("notes")} htmlFor="notes">
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
        </QuickAddPinnedFields>

        <div className={footerClass}>
          <AuthSubmitButton>
            {mode === "create" ? t("createPlannerSubmit") : t("updateSubmit")}
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
      <input type="hidden" name="type" value={activeType} />
      {mode === "edit" && transportId ? (
        <input type="hidden" name="transportId" value={transportId} />
      ) : null}

      {state.errorCode ? (
        <p className={styles.formError} role="alert">
          {tErrors(state.errorCode)}
        </p>
      ) : null}

      <div className={styles.typeSection}>
        {mode === "create" ? (
          <TransportTypeChooser selectedType={activeType} onSelect={setSelectedType} />
        ) : (
          <p className={styles.typeBadge}>{typeSingularLabel(activeType)}</p>
        )}
      </div>

      {journeyPreview ? (
        <div className={overlayStyles.journeyPreview} aria-live="polite">
          <p className={overlayStyles.journeyRoute}>{journeyPreview.routeLabel}</p>
          {journeyPreview.timeLabel ? (
            <p className={overlayStyles.journeyTime}>{journeyPreview.timeLabel}</p>
          ) : null}
        </div>
      ) : null}

      <section className={styles.section} aria-labelledby="transport-route-heading">
        <h2 id="transport-route-heading" className={styles.sectionTitle}>
          {t("route")}
        </h2>
        <div className={styles.routeRow}>
          <Field
            label={t("from")}
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
          <span className={styles.routeIndicator} aria-hidden>
            ↔
          </span>
          <Field
            label={t("to")}
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
        </div>
        <div className={styles.splitRow}>
          <Field label={t("departureLocationCode")} htmlFor="departureLocationCode">
            <Input
              id="departureLocationCode"
              name="departureLocationCode"
              defaultValue={defaultValues.departureLocationCode}
              maxLength={20}
              dir="auto"
            />
          </Field>
          <Field label={t("arrivalLocationCode")} htmlFor="arrivalLocationCode">
            <Input
              id="arrivalLocationCode"
              name="arrivalLocationCode"
              defaultValue={defaultValues.arrivalLocationCode}
              maxLength={20}
              dir="auto"
            />
          </Field>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="transport-times-heading">
        <h2 id="transport-times-heading" className={styles.sectionTitle}>
          {t("times")}
        </h2>
        <p className={styles.legLabel}>{t("departure")}</p>
        <div className={styles.splitRow}>
          <Field
            label={tCommon("date")}
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
            label={tCommon("time")}
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
        <p className={styles.legLabel}>{t("arrival")}</p>
        <div className={styles.splitRow}>
          <Field
            label={tCommon("date")}
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
            label={tCommon("time")}
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
        <HiddenTimezoneFields
          departureTimezone={defaultValues.departureTimezone}
          arrivalTimezone={defaultValues.arrivalTimezone}
          departureError={state.fieldErrors?.["departure.timezone"]}
          arrivalError={state.fieldErrors?.["arrival.timezone"]}
        />
      </section>

      <section className={styles.section} aria-labelledby="transport-details-heading">
        <h2 id="transport-details-heading" className={styles.sectionTitle}>
          {t("detailsSection")}
        </h2>
        <TypeSpecificFields
          type={activeType}
          defaultValues={defaultValues}
          t={t}
          trainCategoryLabel={trainCategoryLabel}
        />
        <Field label={t("bookingReference")} htmlFor="bookingReference">
          <Input
            id="bookingReference"
            name="bookingReference"
            defaultValue={defaultValues.bookingReference}
            maxLength={80}
          />
        </Field>
        <Field label={tCommon("notes")} htmlFor="notes">
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
            {tCommon("cancel")}
          </Button>
        ) : null}
        <AuthSubmitButton>
          {mode === "create"
            ? plannerPresentation
              ? t("createPlannerSubmit")
              : t("createSubmit")
            : t("updateSubmit")}
        </AuthSubmitButton>
      </div>
    </form>
  );
}
