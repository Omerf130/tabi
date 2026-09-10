"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import {
  createAccommodationAction,
  deleteAccommodationAction,
  updateAccommodationAction,
  type AccommodationActionState,
} from "@/features/accommodations/actions";
import { formatAccommodationDeleteConfirm } from "@/features/accommodations/constants";
import type { AccommodationSettingsViewModel } from "@/features/accommodations/types";
import {
  PlaceSearchField,
  type PlaceSearchSelection,
} from "@/features/places/PlaceSearchField";
import {
  getTripSettingsSectionClassName,
  type TripSettingsVariant,
} from "@/features/trips/settings/section-variant";
import type { CurrencyOption } from "@/features/currency/types";
import { EntityCostFields } from "@/features/finance/EntityCostFields.client";
import sectionStyles from "@/features/trips/settings/TripSettingsSections.module.scss";
import styles from "./TripAccommodationSettings.module.scss";

const initialState: AccommodationActionState = {};

type TripAccommodationSettingsProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  accommodations: AccommodationSettingsViewModel[];
  variant?: TripSettingsVariant;
  financeBaseCurrency?: string;
  currencies?: readonly CurrencyOption[];
};

type AccommodationRowProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  accommodation: AccommodationSettingsViewModel;
  financeBaseCurrency: string;
  currencies: readonly CurrencyOption[];
};

function toInitialGoogleSelection(
  accommodation?: AccommodationSettingsViewModel,
): PlaceSearchSelection | null {
  if (
    !accommodation ||
    accommodation.placeSource !== "google" ||
    !accommodation.googlePlaceId
  ) {
    return null;
  }

  return {
    placeId: accommodation.googlePlaceId,
    primaryText: accommodation.name,
    secondaryText: accommodation.city,
  };
}

function isManualAccommodation(accommodation?: AccommodationSettingsViewModel): boolean {
  if (!accommodation) {
    return false;
  }
  if (accommodation.placeSource === "google" && accommodation.googlePlaceId) {
    return false;
  }
  return true;
}

function TripFields({
  accommodation,
  startDate,
  endDate,
  idPrefix,
  defaultCheckInDate,
}: {
  accommodation?: AccommodationSettingsViewModel;
  startDate: string;
  endDate: string;
  idPrefix: string;
  defaultCheckInDate?: string;
}) {
  return (
    <>
      <div className={styles.formRow}>
        <Field label="תאריך Check-in" htmlFor={`${idPrefix}-checkIn`}>
          <Input
            id={`${idPrefix}-checkIn`}
            name="checkInDate"
            type="date"
            defaultValue={accommodation?.checkInDate ?? defaultCheckInDate}
            min={startDate}
            max={endDate}
            required
          />
        </Field>
        <Field label="תאריך Check-out" htmlFor={`${idPrefix}-checkOut`}>
          <Input
            id={`${idPrefix}-checkOut`}
            name="checkOutDate"
            type="date"
            defaultValue={accommodation?.checkOutDate}
            min={startDate}
            max={endDate}
            required
          />
        </Field>
      </div>
      <Field label="מספר הזמנה" htmlFor={`${idPrefix}-booking`}>
        <Input
          id={`${idPrefix}-booking`}
          name="bookingReference"
          defaultValue={accommodation?.bookingReference}
        />
      </Field>
      <Field label="הערות" htmlFor={`${idPrefix}-notes`}>
        <Textarea
          id={`${idPrefix}-notes`}
          name="notes"
          defaultValue={accommodation?.notes}
          rows={2}
        />
      </Field>
    </>
  );
}

function ManualFields({
  accommodation,
  idPrefix,
}: {
  accommodation?: AccommodationSettingsViewModel;
  idPrefix: string;
}) {
  return (
    <>
      <input type="hidden" name="placeSource" value="manual" />
      <Field label="שם מקום הלינה" htmlFor={`${idPrefix}-manualName`}>
        <Input
          id={`${idPrefix}-manualName`}
          name="manualName"
          defaultValue={accommodation?.manualName}
          required
        />
      </Field>
      <Field
        label="שם מקום הלינה ביפנית"
        htmlFor={`${idPrefix}-manualNameJapanese`}
        hint="אופציונלי — לשימוש במצב מונית"
      >
        <Input
          id={`${idPrefix}-manualNameJapanese`}
          name="manualNameJapanese"
          defaultValue={accommodation?.manualNameJapanese}
          dir="auto"
          lang="ja"
        />
      </Field>
      <Field label="עיר" htmlFor={`${idPrefix}-manualCity`}>
        <Input
          id={`${idPrefix}-manualCity`}
          name="manualCity"
          defaultValue={accommodation?.manualCity}
          required
        />
      </Field>
      <Field label="כתובת באנגלית" htmlFor={`${idPrefix}-manualAddressEnglish`}>
        <Textarea
          id={`${idPrefix}-manualAddressEnglish`}
          name="manualAddressEnglish"
          defaultValue={accommodation?.manualAddressEnglish}
          rows={2}
          dir="auto"
        />
      </Field>
      <Field label="כתובת ביפנית" htmlFor={`${idPrefix}-manualAddressJapanese`}>
        <Textarea
          id={`${idPrefix}-manualAddressJapanese`}
          name="manualAddressJapanese"
          defaultValue={accommodation?.manualAddressJapanese}
          rows={2}
          dir="auto"
          lang="ja"
        />
      </Field>
      <Field label="קישור Google Maps" htmlFor={`${idPrefix}-manualMaps`}>
        <Input
          id={`${idPrefix}-manualMaps`}
          name="manualGoogleMapsUrl"
          type="url"
          defaultValue={accommodation?.manualGoogleMapsUrl}
          inputMode="url"
        />
      </Field>
    </>
  );
}

export function TripAccommodationForm({
  tripId,
  accommodation,
  startDate,
  endDate,
  idPrefix,
  action,
  submitLabel,
  defaultCheckInDate,
  onCancel,
  onSuccess,
  financeBaseCurrency = "ILS",
  currencies = [],
}: {
  tripId: string;
  accommodation?: AccommodationSettingsViewModel;
  startDate: string;
  endDate: string;
  idPrefix: string;
  action:
    | typeof createAccommodationAction
    | typeof updateAccommodationAction;
  submitLabel: string;
  defaultCheckInDate?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  financeBaseCurrency?: string;
  currencies?: readonly CurrencyOption[];
}) {
  const router = useRouter();
  const [manualMode, setManualMode] = useState(isManualAccommodation(accommodation));
  const [googleSelection, setGoogleSelection] = useState<PlaceSearchSelection | null>(
    toInitialGoogleSelection(accommodation),
  );
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (state.ok) {
      onSuccess?.();
      router.refresh();
    }
  }, [onSuccess, router, state.ok]);

  const isGoogleMode = !manualMode;
  const canSubmitGoogle = manualMode || Boolean(googleSelection);

  return (
    <form action={formAction} className={styles.editForm}>
      <input type="hidden" name="tripId" value={tripId} />
      {accommodation ? (
        <input type="hidden" name="accommodationId" value={accommodation.id} />
      ) : null}

      {isGoogleMode ? (
        <>
          <PlaceSearchField
            key={`${idPrefix}-${accommodation?.id ?? "new"}-${accommodation?.googlePlaceId ?? "none"}`}
            tripId={tripId}
            inputId={`${idPrefix}-place-search`}
            initialSelection={googleSelection}
            onSelectionChange={setGoogleSelection}
          />
          <button
            type="button"
            className={styles.manualToggle}
            onClick={() => {
              setManualMode(true);
              setGoogleSelection(null);
            }}
          >
            לא מצאת את המקום? הזנה ידנית
          </button>
        </>
      ) : (
        <>
          <ManualFields accommodation={accommodation} idPrefix={idPrefix} />
          <button
            type="button"
            className={styles.manualToggle}
            onClick={() => setManualMode(false)}
          >
            חזרה לחיפוש Google
          </button>
        </>
      )}

      <TripFields
        accommodation={accommodation}
        startDate={startDate}
        endDate={endDate}
        idPrefix={idPrefix}
        defaultCheckInDate={defaultCheckInDate}
      />

      {currencies.length > 0 ? (
        <EntityCostFields
          baseCurrency={financeBaseCurrency}
          currencies={currencies}
          linkedCost={accommodation?.linkedCost}
          idPrefix={`${idPrefix}-cost`}
        />
      ) : null}

      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? <p className={styles.success}>{state.success}</p> : null}

      <div className={styles.rowActions}>
        {canSubmitGoogle ? (
          <AuthSubmitButton>{submitLabel}</AuthSubmitButton>
        ) : (
          <Button type="button" disabled>
            {submitLabel}
          </Button>
        )}
        {onCancel ? (
          <Button type="button" variant="ghost" size="compact" onClick={onCancel}>
            ביטול
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function AccommodationRow({
  tripId,
  startDate,
  endDate,
  accommodation,
  financeBaseCurrency,
  currencies,
}: AccommodationRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleteState, deleteAction] = useActionState(
    deleteAccommodationAction,
    initialState,
  );

  useEffect(() => {
    if (deleteState.ok) {
      router.refresh();
    }
  }, [deleteState.ok, router]);

  if (editing) {
    return (
      <li className={styles.item}>
        <TripAccommodationForm
          tripId={tripId}
          accommodation={accommodation}
          startDate={startDate}
          endDate={endDate}
          idPrefix={`edit-${accommodation.id}`}
          action={updateAccommodationAction}
          submitLabel="שמירה"
          onCancel={() => setEditing(false)}
          financeBaseCurrency={financeBaseCurrency}
          currencies={currencies}
        />
      </li>
    );
  }

  function handleDelete() {
    if (!window.confirm(formatAccommodationDeleteConfirm())) {
      return;
    }
    const form = document.getElementById(
      `delete-accommodation-${accommodation.id}`,
    ) as HTMLFormElement | null;
    form?.requestSubmit();
  }

  return (
    <li className={styles.item}>
      <div className={styles.itemBody}>
        <p className={styles.itemName} dir="auto">
          {accommodation.name}
        </p>
        {accommodation.nameJapanese ? (
          <p className={styles.itemNameJapanese} dir="auto" lang="ja">
            {accommodation.nameJapanese}
          </p>
        ) : null}
        <p className={styles.itemMeta}>
          {accommodation.city} · {accommodation.dateRangeLabel}
        </p>
        {accommodation.placeSource === "google" ? (
          <p className={styles.itemSource}>מקור: Google Places</p>
        ) : null}
      </div>
      <div className={styles.rowActions}>
        <Button
          type="button"
          variant="ghost"
          size="compact"
          onClick={() => setEditing(true)}
        >
          עריכה
        </Button>
        <Button
          type="button"
          variant="danger"
          size="compact"
          onClick={handleDelete}
        >
          מחיקת מקום לינה
        </Button>
      </div>
      <form
        id={`delete-accommodation-${accommodation.id}`}
        action={deleteAction}
        hidden
      >
        <input type="hidden" name="tripId" value={tripId} />
        <input
          type="hidden"
          name="accommodationId"
          value={accommodation.id}
        />
      </form>
      {deleteState.error ? (
        <p className={styles.error} role="alert">
          {deleteState.error}
        </p>
      ) : null}
      {deleteState.ok && deleteState.success ? (
        <p className={styles.success} role="status">
          {deleteState.success}
        </p>
      ) : null}
    </li>
  );
}

export function TripAccommodationSettings({
  tripId,
  startDate,
  endDate,
  accommodations,
  variant = "stack",
  financeBaseCurrency = "ILS",
  currencies = [],
}: TripAccommodationSettingsProps) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <section
      id="accommodations"
      className={getTripSettingsSectionClassName(variant)}
      aria-labelledby="trip-accommodations-title"
    >
      <div className={sectionStyles.header}>
        <h2 id="trip-accommodations-title" className={sectionStyles.title}>
          מקומות לינה
        </h2>
        <p className={sectionStyles.hint}>
          חפשו מקום לינה אמיתי ב-Google. Tabi שומרת את זהות המקום; אתם מוסיפים
          רק תאריכים, הזמנה והערות.
        </p>
      </div>

      {!showCreate ? (
        <Button type="button" variant="ghost" onClick={() => setShowCreate(true)}>
          + הוספת מקום לינה
        </Button>
      ) : (
        <div className={styles.createForm}>
          <p className={styles.createLabel}>הוספת מקום לינה</p>
          <TripAccommodationForm
            tripId={tripId}
            startDate={startDate}
            endDate={endDate}
            idPrefix="create"
            action={createAccommodationAction}
            submitLabel="הוספה"
            onCancel={() => setShowCreate(false)}
            financeBaseCurrency={financeBaseCurrency}
            currencies={currencies}
          />
        </div>
      )}

      {accommodations.length > 0 ? (
        <ul className={styles.list}>
          {accommodations.map((accommodation) => (
            <AccommodationRow
              key={accommodation.id}
              tripId={tripId}
              startDate={startDate}
              endDate={endDate}
              accommodation={accommodation}
              financeBaseCurrency={financeBaseCurrency}
              currencies={currencies}
            />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>אין מקומות לינה עדיין.</p>
      )}
    </section>
  );
}
