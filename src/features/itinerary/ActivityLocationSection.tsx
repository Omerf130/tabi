"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/Input/Input";
import { PLACES_ACTIVITY_PRIMARY_TYPES } from "@/features/places/constants";
import addItemStyles from "./AddItemFlow.module.scss";
import {
  PlaceSearchField,
  type PlaceSearchSelection,
} from "@/features/places/PlaceSearchField";
import {
  clearGoogleActivityFields,
  toActivityFormValuesFromGoogleSelection,
  toActivityPlaceSearchSelectionFromFormValues,
} from "./activity-place-domain";
import type { ActivityFieldErrors } from "./actions";
import type { ActivityFormValues } from "./types";
import styles from "./ActivityForm.module.scss";

export type ActivityPlaceMode = "google" | "manual";

type ActivityLocationSectionProps = {
  tripId: string;
  defaultValues: ActivityFormValues;
  placeMode: ActivityPlaceMode;
  fieldErrors?: ActivityFieldErrors;
  onDirtyChange?: () => void;
  onGoogleSelectionChange?: (input: {
    hasSelection: boolean;
    locationName?: string;
  }) => void;
  plannerPresentation?: boolean;
};

export function ActivityLocationSection({
  tripId,
  defaultValues,
  placeMode,
  fieldErrors,
  onDirtyChange,
  onGoogleSelectionChange,
  plannerPresentation = false,
}: ActivityLocationSectionProps) {
  const initialGoogleSelection =
    toActivityPlaceSearchSelectionFromFormValues(defaultValues);

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
        onGoogleSelectionChange?.({ hasSelection: false });
        return;
      }
      const fields = toActivityFormValuesFromGoogleSelection(selection);
      setGoogleFields(fields);
      onGoogleSelectionChange?.({
        hasSelection: true,
        locationName: fields.locationName,
      });
    },
    [onDirtyChange, onGoogleSelectionChange],
  );

  if (placeMode === "google") {
    const googleFieldsBlock = (
      <>
        <PlaceSearchField
          tripId={tripId}
          inputId="activity-place-search"
          label="חיפוש מקום"
          placeholder="חיפוש מקום..."
          includedPrimaryTypes={PLACES_ACTIVITY_PRIMARY_TYPES}
          resolvePurpose="activity"
          includeHiddenFields={false}
          initialSelection={initialGoogleSelection}
          onSelectionChange={handleGoogleSelectionChange}
          presentation={plannerPresentation ? "planner" : "default"}
          hideLabel={plannerPresentation}
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
      </>
    );

    if (plannerPresentation) {
      return (
        <>
          {googleFieldsBlock}
          {fieldErrors?.locationName ? (
            <p className={addItemStyles.overlayError} role="alert">
              {fieldErrors.locationName}
            </p>
          ) : null}
        </>
      );
    }

    return (
      <div className={styles.locationSection}>
        {googleFieldsBlock}
        {fieldErrors?.locationName ? (
          <p className={styles.formError} role="alert">
            {fieldErrors.locationName}
          </p>
        ) : null}
      </div>
    );
  }

  if (plannerPresentation) {
    return (
      <div className={addItemStyles.blockField}>
        <input type="hidden" name="placeSource" value="manual" />
        <label className={addItemStyles.pairLabel} htmlFor="locationName">
          שם המקום
        </label>
        <input
          id="locationName"
          className={addItemStyles.blockInput}
          name="locationName"
          defaultValue={defaultValues.locationName}
          maxLength={200}
          dir="auto"
          aria-invalid={fieldErrors?.locationName ? true : undefined}
        />
        <label className={addItemStyles.pairLabel} htmlFor="address">
          כתובת
        </label>
        <input
          id="address"
          className={addItemStyles.blockInput}
          name="address"
          defaultValue={defaultValues.address}
          maxLength={500}
          dir="auto"
          aria-invalid={fieldErrors?.address ? true : undefined}
        />
        {fieldErrors?.locationName || fieldErrors?.address ? (
          <p className={addItemStyles.overlayError} role="alert">
            {fieldErrors.locationName ?? fieldErrors.address}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.locationSection}>
      <input type="hidden" name="placeSource" value="manual" />
      <div className={styles.typeField}>
        <label className={styles.fieldLabel} htmlFor="locationName">
          שם המקום
        </label>
        <Input
          id="locationName"
          name="locationName"
          defaultValue={defaultValues.locationName}
          maxLength={200}
          dir="auto"
          aria-invalid={fieldErrors?.locationName ? true : undefined}
        />
      </div>
      <div className={styles.typeField}>
        <label className={styles.fieldLabel} htmlFor="address">
          כתובת
        </label>
        <Input
          id="address"
          name="address"
          defaultValue={defaultValues.address}
          maxLength={500}
          dir="auto"
          aria-invalid={fieldErrors?.address ? true : undefined}
        />
      </div>
      {fieldErrors?.address ? (
        <p className={styles.formError} role="alert">
          {fieldErrors.address}
        </p>
      ) : null}
    </div>
  );
}
