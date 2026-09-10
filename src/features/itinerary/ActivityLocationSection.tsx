"use client";

import { useCallback, useState } from "react";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { PLACES_ACTIVITY_PRIMARY_TYPES } from "@/features/places/constants";
import {
  PlaceSearchField,
  type PlaceSearchSelection,
} from "@/features/places/PlaceSearchField";
import {
  clearGoogleActivityFields,
  isGoogleBackedActivity,
  toActivityFormValuesFromGoogleSelection,
  toActivityPlaceSearchSelectionFromFormValues,
} from "./activity-place-domain";
import type { ActivityFieldErrors } from "./actions";
import type { ActivityFormValues } from "./types";
import styles from "./ActivityForm.module.scss";

type ActivityLocationSectionProps = {
  tripId: string;
  defaultValues: ActivityFormValues;
  fieldErrors?: ActivityFieldErrors;
  onDirtyChange?: () => void;
};

export function ActivityLocationSection({
  tripId,
  defaultValues,
  fieldErrors,
  onDirtyChange,
}: ActivityLocationSectionProps) {
  const initialGoogleSelection =
    toActivityPlaceSearchSelectionFromFormValues(defaultValues);

  const [manualMode, setManualMode] = useState(
    defaultValues.placeSource !== "google" || !defaultValues.googlePlaceId,
  );
  const [googleSearchKey, setGoogleSearchKey] = useState(0);
  const [googleFields, setGoogleFields] = useState<
    Pick<
      ActivityFormValues,
      | "placeSource"
      | "googlePlaceId"
      | "locationName"
      | "address"
      | "city"
      | "country"
      | "latitude"
      | "longitude"
      | "googleMapsUrl"
    >
  >(() =>
    initialGoogleSelection
      ? toActivityFormValuesFromGoogleSelection(initialGoogleSelection)
      : clearGoogleActivityFields(),
  );

  const handleGoogleSelectionChange = useCallback(
    (selection: PlaceSearchSelection | null) => {
      onDirtyChange?.();
      if (!selection) {
        setGoogleFields(clearGoogleActivityFields());
        return;
      }
      setGoogleFields(toActivityFormValuesFromGoogleSelection(selection));
    },
    [onDirtyChange],
  );

  const switchToManual = () => {
    onDirtyChange?.();
    setManualMode(true);
    setGoogleFields(clearGoogleActivityFields());
  };

  const switchToGoogle = () => {
    onDirtyChange?.();
    setManualMode(false);
    setGoogleSearchKey((current) => current + 1);
  };

  if (!manualMode) {
    return (
      <div className={styles.locationSection}>
        <PlaceSearchField
          key={`activity-place-search-${googleSearchKey}`}
          tripId={tripId}
          inputId="activity-place-search"
          label="חיפוש מקום"
          placeholder="Nishiki Market..."
          includedPrimaryTypes={PLACES_ACTIVITY_PRIMARY_TYPES}
          resolvePurpose="activity"
          includeHiddenFields={false}
          initialSelection={initialGoogleSelection}
          onSelectionChange={handleGoogleSelectionChange}
        />
        <input type="hidden" name="placeSource" value="google" />
        <input type="hidden" name="googlePlaceId" value={googleFields.googlePlaceId} />
        <input type="hidden" name="locationName" value={googleFields.locationName} />
        <input type="hidden" name="address" value={googleFields.address} />
        <input type="hidden" name="city" value={googleFields.city} />
        <input type="hidden" name="country" value={googleFields.country} />
        <input type="hidden" name="latitude" value={googleFields.latitude} />
        <input type="hidden" name="longitude" value={googleFields.longitude} />
        <input type="hidden" name="googleMapsUrl" value={googleFields.googleMapsUrl} />
        {fieldErrors?.locationName ? (
          <p className={styles.formError} role="alert">
            {fieldErrors.locationName}
          </p>
        ) : null}
        <button type="button" className={styles.manualToggle} onClick={switchToManual}>
          הזנה ידנית
        </button>
      </div>
    );
  }

  return (
    <div className={styles.locationSection}>
      <input type="hidden" name="placeSource" value="manual" />
      <Field
        label="שם המקום"
        htmlFor="locationName"
        error={fieldErrors?.locationName}
      >
        <Input
          id="locationName"
          name="locationName"
          defaultValue={defaultValues.locationName}
          maxLength={200}
          aria-invalid={fieldErrors?.locationName ? true : undefined}
        />
      </Field>
      <Field label="כתובת" htmlFor="address" error={fieldErrors?.address}>
        <Input
          id="address"
          name="address"
          defaultValue={defaultValues.address}
          maxLength={500}
          dir="auto"
          aria-invalid={fieldErrors?.address ? true : undefined}
        />
      </Field>
      {isGoogleBackedActivity(defaultValues) || defaultValues.googlePlaceId ? (
        <button type="button" className={styles.manualToggle} onClick={switchToGoogle}>
          חיפוש מקום ב-Google
        </button>
      ) : (
        <button type="button" className={styles.manualToggle} onClick={switchToGoogle}>
          חיפוש מקום
        </button>
      )}
    </div>
  );
}
