"use client";

import { useActionState, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import {
  removeTripCoverAction,
  uploadTripCoverAction,
  type TripCoverActionState,
} from "@/features/trips/cover/actions";
import { getTripCoverPath } from "@/features/trips/cover/constants";
import {
  translateCoverError,
  translateCoverSuccess,
} from "@/features/trips/cover/translate-cover-error";
import {
  getTripSettingsSectionClassName,
  type TripSettingsVariant,
} from "@/features/trips/settings/section-variant";
import sectionStyles from "@/features/trips/settings/TripSettingsSections.module.scss";
import styles from "./TripCoverSettings.module.scss";

const initialState: TripCoverActionState = {};

type TripCoverSettingsProps = {
  tripId: string;
  hasCover: boolean;
  isOwner: boolean;
  variant?: TripSettingsVariant;
};

export function TripCoverSettings({
  tripId,
  hasCover,
  isOwner,
  variant = "stack",
}: TripCoverSettingsProps) {
  const t = useTranslations("TripCover");
  const tCommon = useTranslations("Common");
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, uploadAction] = useActionState(
    uploadTripCoverAction,
    initialState,
  );
  const [removeState, removeAction] = useActionState(
    removeTripCoverAction,
    initialState,
  );

  const uploadError = translateCoverError(t, uploadState.errorCode);
  const uploadSuccess = translateCoverSuccess(t, uploadState.successCode);
  const removeError = translateCoverError(t, removeState.errorCode);
  const removeSuccess = translateCoverSuccess(t, removeState.successCode);

  const openUpload = () => {
    setShowUpload(true);
    requestAnimationFrame(() => {
      fileInputRef.current?.focus();
    });
  };

  return (
    <section className={getTripSettingsSectionClassName(variant)}>
      <div className={styles.header}>
        <h2 className={sectionStyles.title}>{t("title")}</h2>
        <p className={sectionStyles.hint}>{t("hint")}</p>
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
        <p className={styles.empty}>{t("empty")}</p>
      )}

      {isOwner ? (
        <div className={styles.actions}>
          {!showUpload ? (
            <Button type="button" variant="ghost" onClick={openUpload}>
              {hasCover ? t("replacePhoto") : t("uploadPhoto")}
            </Button>
          ) : (
            <form action={uploadAction} className={styles.uploadForm}>
              <input type="hidden" name="tripId" value={tripId} />
              <Field label={t("uploadField")} htmlFor="trip-cover">
                <input
                  ref={fileInputRef}
                  id="trip-cover"
                  name="cover"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className={styles.fileInput}
                />
              </Field>
              {uploadError ? (
                <p className={styles.error} role="alert">
                  {uploadError}
                </p>
              ) : null}
              {uploadSuccess ? (
                <p className={styles.success}>{uploadSuccess}</p>
              ) : null}
              <div className={styles.uploadActions}>
                <AuthSubmitButton>
                  {hasCover ? t("replaceSubmit") : t("uploadSubmit")}
                </AuthSubmitButton>
                <Button
                  type="button"
                  variant="ghost"
                  size="compact"
                  onClick={() => setShowUpload(false)}
                >
                  {tCommon("cancel")}
                </Button>
              </div>
            </form>
          )}

          {hasCover ? (
            <form action={removeAction}>
              <input type="hidden" name="tripId" value={tripId} />
              <Button type="submit" variant="ghost" size="compact">
                {t("remove")}
              </Button>
              {removeError ? (
                <p className={styles.error} role="alert">
                  {removeError}
                </p>
              ) : null}
              {removeSuccess ? (
                <p className={styles.success}>{removeSuccess}</p>
              ) : null}
            </form>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
