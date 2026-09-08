"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import {
  removeTripCoverAction,
  uploadTripCoverAction,
  type TripCoverActionState,
} from "@/features/trips/cover/actions";
import { getTripCoverPath } from "@/features/trips/cover/constants";
import sectionStyles from "@/features/trips/settings/TripSettingsSections.module.scss";
import styles from "./TripCoverSettings.module.scss";

const initialState: TripCoverActionState = {};

type TripCoverSettingsProps = {
  tripId: string;
  hasCover: boolean;
  isOwner: boolean;
};

export function TripCoverSettings({
  tripId,
  hasCover,
  isOwner,
}: TripCoverSettingsProps) {
  const [uploadState, uploadAction] = useActionState(
    uploadTripCoverAction,
    initialState,
  );
  const [removeState, removeAction] = useActionState(
    removeTripCoverAction,
    initialState,
  );

  return (
    <section className={sectionStyles.section}>
      <div className={styles.header}>
        <h2 className={sectionStyles.title}>תמונת הטיול</h2>
        <p className={sectionStyles.hint}>
          תמונה אישית שתופיע בראש מסך הבית. JPEG, PNG או WebP עד 5MB.
        </p>
      </div>

      {hasCover ? (
        <div className={styles.previewWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getTripCoverPath(tripId)}
            alt=""
            className={styles.preview}
          />
        </div>
      ) : (
        <p className={styles.empty}>עדיין לא נבחרה תמונת טיול.</p>
      )}

      {isOwner ? (
        <div className={styles.actions}>
          <form action={uploadAction} className={styles.uploadForm}>
            <input type="hidden" name="tripId" value={tripId} />
            <Field label="העלאת תמונה" htmlFor="trip-cover">
              <input
                id="trip-cover"
                name="cover"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={styles.fileInput}
              />
            </Field>
            {uploadState.error ? (
              <p className={styles.error} role="alert">
                {uploadState.error}
              </p>
            ) : null}
            {uploadState.success ? (
              <p className={styles.success}>{uploadState.success}</p>
            ) : null}
            <AuthSubmitButton>{hasCover ? "החלפה" : "העלאה"}</AuthSubmitButton>
          </form>

          {hasCover ? (
            <form action={removeAction}>
              <input type="hidden" name="tripId" value={tripId} />
              <Button type="submit" variant="ghost" size="compact">
                הסרה
              </Button>
              {removeState.error ? (
                <p className={styles.error} role="alert">
                  {removeState.error}
                </p>
              ) : null}
              {removeState.success ? (
                <p className={styles.success}>{removeState.success}</p>
              ) : null}
            </form>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
