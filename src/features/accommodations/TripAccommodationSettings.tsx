"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { formatAccommodationDeleteConfirm } from "@/features/accommodations/accommodation-labels";
import type { AccommodationSettingsViewModel } from "@/features/accommodations/types";
import {
  translateAccommodationError,
  translateAccommodationSuccess,
} from "@/features/accommodations/translate-accommodation-error";
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
import overlayStyles from "@/features/itinerary/AddItemFlow.module.scss";
import { QuickAddPinnedFields } from "@/features/quick-add/QuickAddPinnedFields.client";
import {
  mergePlannerPinnedFormClass,
  resolvePinnedPlannerFooterClass,
} from "@/features/quick-add/quick-add-pinned-form";
import { PlaceModeSegment } from "@/features/itinerary/PlaceModeSegment.client";
import sectionStyles from "@/features/trips/settings/TripSettingsSections.module.scss";
import { TripSettingsCollectionEmpty } from "@/features/trips/settings/TripSettingsCollectionEmpty.client";
import { IconAccommodation } from "@/components/ui/icons";
import { getMaxAccommodationCheckOutDate } from "./accommodation-date-semantics";
import {
  resolveAccommodationLocalFieldLang,
  resolveAccommodationLocalFieldMessageKeys,
} from "./accommodation-local-field-labels";
import styles from "./TripAccommodationSettings.module.scss";

const initialState: AccommodationActionState = {};

type TripAccommodationSettingsProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  destinationCountryCode?: string | null;
  accommodations: AccommodationSettingsViewModel[];
  variant?: TripSettingsVariant;
  financeBaseCurrency?: string;
  currencies?: readonly CurrencyOption[];
};

type AccommodationRowProps = {
  tripId: string;
  startDate: string;
  endDate: string;
  destinationCountryCode?: string | null;
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
  const t = useTranslations("Accommodation");
  const tCommon = useTranslations("Common");
  const maxCheckOutDate = getMaxAccommodationCheckOutDate(endDate);

  return (
    <>
      <div className={styles.formRow}>
        <Field label={t("checkIn")} htmlFor={`${idPrefix}-checkIn`}>
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
        <Field label={t("checkOut")} htmlFor={`${idPrefix}-checkOut`}>
          <Input
            id={`${idPrefix}-checkOut`}
            name="checkOutDate"
            type="date"
            defaultValue={accommodation?.checkOutDate}
            min={startDate}
            max={maxCheckOutDate}
            required
          />
        </Field>
      </div>
      <Field label={t("bookingReference")} htmlFor={`${idPrefix}-booking`}>
        <Input
          id={`${idPrefix}-booking`}
          name="bookingReference"
          defaultValue={accommodation?.bookingReference}
        />
      </Field>
      <Field label={tCommon("notes")} htmlFor={`${idPrefix}-notes`}>
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
  destinationCountryCode,
}: {
  accommodation?: AccommodationSettingsViewModel;
  idPrefix: string;
  destinationCountryCode?: string | null;
}) {
  const t = useTranslations("Accommodation");
  const localFieldKeys = resolveAccommodationLocalFieldMessageKeys(destinationCountryCode);
  const localLang = resolveAccommodationLocalFieldLang(destinationCountryCode);

  return (
    <>
      <input type="hidden" name="placeSource" value="manual" />
      <Field label={t("manualName")} htmlFor={`${idPrefix}-manualName`}>
        <Input
          id={`${idPrefix}-manualName`}
          name="manualName"
          defaultValue={accommodation?.manualName}
          required
        />
      </Field>
      <Field
        label={t(localFieldKeys.manualNameLabelKey)}
        htmlFor={`${idPrefix}-manualNameJapanese`}
        hint={t(localFieldKeys.manualNameHintKey)}
      >
        <Input
          id={`${idPrefix}-manualNameJapanese`}
          name="manualNameJapanese"
          defaultValue={accommodation?.manualNameJapanese}
          dir="auto"
          lang={localLang}
        />
      </Field>
      <Field label={t("city")} htmlFor={`${idPrefix}-manualCity`}>
        <Input
          id={`${idPrefix}-manualCity`}
          name="manualCity"
          defaultValue={accommodation?.manualCity}
          required
        />
      </Field>
      <Field label={t("addressEnglish")} htmlFor={`${idPrefix}-manualAddressEnglish`}>
        <Textarea
          id={`${idPrefix}-manualAddressEnglish`}
          name="manualAddressEnglish"
          defaultValue={accommodation?.manualAddressEnglish}
          rows={2}
          dir="auto"
        />
      </Field>
      <Field
        label={t(localFieldKeys.addressLabelKey)}
        htmlFor={`${idPrefix}-manualAddressJapanese`}
      >
        <Textarea
          id={`${idPrefix}-manualAddressJapanese`}
          name="manualAddressJapanese"
          defaultValue={accommodation?.manualAddressJapanese}
          rows={2}
          dir="auto"
          lang={localLang}
        />
      </Field>
      <Field label={t("googleMapsLink")} htmlFor={`${idPrefix}-manualMaps`}>
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
  destinationCountryCode,
  action,
  submitLabel,
  defaultCheckInDate,
  onCancel,
  onSuccess,
  financeBaseCurrency = "ILS",
  currencies = [],
  plannerPresentation = false,
  overlayNavigation = false,
  pinnedActionFooter = false,
}: {
  tripId: string;
  accommodation?: AccommodationSettingsViewModel;
  startDate: string;
  endDate: string;
  idPrefix: string;
  destinationCountryCode?: string | null;
  action:
    | typeof createAccommodationAction
    | typeof updateAccommodationAction;
  submitLabel: string;
  defaultCheckInDate?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  financeBaseCurrency?: string;
  currencies?: readonly CurrencyOption[];
  plannerPresentation?: boolean;
  overlayNavigation?: boolean;
  pinnedActionFooter?: boolean;
}) {
  const t = useTranslations("Accommodation");
  const tActivity = useTranslations("Activity");
  const tCommon = useTranslations("Common");
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
  const errorMessage = translateAccommodationError(t, state.errorCode);
  const successMessage = translateAccommodationSuccess(t, state.successCode);

  const plannerFooterClass = resolvePinnedPlannerFooterClass(
    pinnedActionFooter,
    overlayStyles.plannerFooter,
  );

  return (
    <form
      action={formAction}
      className={
        plannerPresentation
          ? mergePlannerPinnedFormClass(overlayStyles.plannerForm, pinnedActionFooter)
          : styles.editForm
      }
    >
      <QuickAddPinnedFields pinnedActionFooter={pinnedActionFooter && plannerPresentation}>
      <input type="hidden" name="tripId" value={tripId} />
      {accommodation ? (
        <input type="hidden" name="accommodationId" value={accommodation.id} />
      ) : null}

      {plannerPresentation ? (
        <div className={overlayStyles.searchGroup}>
          <PlaceModeSegment
            mode={isGoogleMode ? "google" : "manual"}
            googleLabel={t("hotelSearch")}
            manualLabel={tActivity("placeSearchManual")}
            onChange={(mode) => {
              setManualMode(mode === "manual");
              setGoogleSelection(null);
            }}
          />
          {isGoogleMode ? (
            <>
              <p className={overlayStyles.searchGroupLabel}>{tActivity("whereQuestion")}</p>
              <PlaceSearchField
                key={`${idPrefix}-${accommodation?.id ?? "new"}-${accommodation?.googlePlaceId ?? "none"}`}
                tripId={tripId}
                inputId={`${idPrefix}-place-search`}
                label={t("hotelSearch")}
                placeholder={t("hotelSearchPlaceholder")}
                initialSelection={googleSelection}
                onSelectionChange={setGoogleSelection}
                presentation="planner"
                hideLabel
              />
            </>
          ) : null}
        </div>
      ) : null}

      {!plannerPresentation && isGoogleMode ? (
        <>
          <PlaceSearchField
            key={`${idPrefix}-${accommodation?.id ?? "new"}-${accommodation?.googlePlaceId ?? "none"}`}
            tripId={tripId}
            inputId={`${idPrefix}-place-search`}
            label={t("hotelSearch")}
            placeholder={t("hotelSearchPlaceholder")}
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
            {t("manualEntryPrompt")}
          </button>
        </>
      ) : null}

      {!isGoogleMode ? (
        <>
          <ManualFields
            accommodation={accommodation}
            idPrefix={idPrefix}
            destinationCountryCode={destinationCountryCode}
          />
          {!plannerPresentation ? (
            <button
              type="button"
              className={styles.manualToggle}
              onClick={() => setManualMode(false)}
            >
              {t("backToGoogleSearch")}
            </button>
          ) : null}
        </>
      ) : null}

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
          showHelper={!plannerPresentation}
          idPrefix={`${idPrefix}-cost`}
        />
      ) : null}

      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}
      {successMessage ? <p className={styles.success}>{successMessage}</p> : null}
      </QuickAddPinnedFields>

      {plannerPresentation ? (
        <div className={plannerFooterClass}>
          {canSubmitGoogle ? (
            <AuthSubmitButton>{submitLabel}</AuthSubmitButton>
          ) : (
            <Button type="button" disabled>
              {submitLabel}
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.rowActions}>
          {canSubmitGoogle ? (
            <AuthSubmitButton>{submitLabel}</AuthSubmitButton>
          ) : (
            <Button type="button" disabled>
              {submitLabel}
            </Button>
          )}
          {onCancel && !overlayNavigation ? (
            <Button type="button" variant="ghost" size="compact" onClick={onCancel}>
              {tCommon("cancel")}
            </Button>
          ) : null}
        </div>
      )}
    </form>
  );
}

function AccommodationRow({
  tripId,
  startDate,
  endDate,
  destinationCountryCode,
  accommodation,
  financeBaseCurrency,
  currencies,
}: AccommodationRowProps) {
  const t = useTranslations("Accommodation");
  const tCommon = useTranslations("Common");
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
          destinationCountryCode={destinationCountryCode}
          idPrefix={`edit-${accommodation.id}`}
          action={updateAccommodationAction}
          submitLabel={tCommon("save")}
          onCancel={() => setEditing(false)}
          financeBaseCurrency={financeBaseCurrency}
          currencies={currencies}
        />
      </li>
    );
  }

  function handleDelete() {
    if (!window.confirm(formatAccommodationDeleteConfirm(t))) {
      return;
    }
    const form = document.getElementById(
      `delete-accommodation-${accommodation.id}`,
    ) as HTMLFormElement | null;
    form?.requestSubmit();
  }

  const deleteError = translateAccommodationError(t, deleteState.errorCode);
  const deleteSuccess = translateAccommodationSuccess(t, deleteState.successCode);

  return (
    <li className={styles.item}>
      <div className={styles.itemBody}>
        <p className={styles.itemName} dir="auto">
          {accommodation.name}
        </p>
        {accommodation.nameJapanese ? (
          <p
            className={styles.itemNameJapanese}
            dir="auto"
            lang={resolveAccommodationLocalFieldLang(destinationCountryCode)}
          >
            {accommodation.nameJapanese}
          </p>
        ) : null}
        <p className={styles.itemMeta}>
          {accommodation.city} · {accommodation.dateRangeLabel}
        </p>
        {accommodation.placeSource === "google" ? (
          <p className={styles.itemSource}>{t("googleSource")}</p>
        ) : null}
      </div>
      <div className={styles.rowActions}>
        <Button
          type="button"
          variant="ghost"
          size="compact"
          onClick={() => setEditing(true)}
        >
          {tCommon("edit")}
        </Button>
        <Button
          type="button"
          variant="danger"
          size="compact"
          onClick={handleDelete}
        >
          {t("deleteStay")}
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
      {deleteError ? (
        <p className={styles.error} role="alert">
          {deleteError}
        </p>
      ) : null}
      {deleteState.ok && deleteSuccess ? (
        <p className={styles.success} role="status">
          {deleteSuccess}
        </p>
      ) : null}
    </li>
  );
}

export function TripAccommodationSettings({
  tripId,
  startDate,
  endDate,
  destinationCountryCode,
  accommodations,
  variant = "stack",
  financeBaseCurrency = "ILS",
  currencies = [],
}: TripAccommodationSettingsProps) {
  const t = useTranslations("Accommodation");
  const [showCreate, setShowCreate] = useState(false);

  return (
    <section
      id="accommodations"
      className={getTripSettingsSectionClassName(variant)}
      aria-labelledby="trip-accommodations-title"
    >
      <div className={sectionStyles.header}>
        <h2 id="trip-accommodations-title" className={sectionStyles.title}>
          {t("settingsTitle")}
        </h2>
        <p className={sectionStyles.hint}>{t("settingsHint")}</p>
      </div>

      {!showCreate ? (
        <Button type="button" variant="ghost" onClick={() => setShowCreate(true)}>
          {t("addStay")}
        </Button>
      ) : (
        <div className={styles.createForm}>
          <p className={styles.createLabel}>{t("addStayLabel")}</p>
          <TripAccommodationForm
            tripId={tripId}
            startDate={startDate}
            endDate={endDate}
            destinationCountryCode={destinationCountryCode}
            idPrefix="create"
            action={createAccommodationAction}
            submitLabel={t("addSubmit")}
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
              destinationCountryCode={destinationCountryCode}
              accommodation={accommodation}
              financeBaseCurrency={financeBaseCurrency}
              currencies={currencies}
            />
          ))}
        </ul>
      ) : (
        <TripSettingsCollectionEmpty
          className={styles.settingsCollectionEmpty}
          title={t("emptySettings")}
          icon={<IconAccommodation aria-hidden />}
        />
      )}
    </section>
  );
}
