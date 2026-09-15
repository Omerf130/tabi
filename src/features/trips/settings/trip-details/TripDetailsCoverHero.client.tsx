"use client";

import { useActionState, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import { resolveTripVisualSrc } from "@/features/destination-visuals/resolve-trip-visual-src";
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
import styles from "./TripDetailsSettings.module.scss";

const initialState: TripCoverActionState = {};

type TripDetailsCoverHeroProps = {
  tripId: string;
  hasCover: boolean;
  coverVisualKey: string | null;
  isOwner: boolean;
};

export function TripDetailsCoverHero({
  tripId,
  hasCover,
  coverVisualKey,
  isOwner,
}: TripDetailsCoverHeroProps) {
  const t = useTranslations("TripCover");
  const tDetails = useTranslations("TripDetailsSettings");
  const tCommon = useTranslations("Common");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

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

  const fallbackVisual = resolveTripVisualSrc({
    hasCoverImage: hasCover,
    tripId,
    coverVisualKey,
  });

  const imageSrc = hasCover ? getTripCoverPath(tripId) : fallbackVisual.imageSrc;

  return (
    <div className={styles.coverHero}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSrc} alt="" className={styles.coverImage} />
      <div className={styles.coverScrim} aria-hidden />

      {isOwner ? (
        <div className={styles.coverActions}>
          {!uploadOpen ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="compact"
                className={styles.coverActionButton}
                onClick={() => {
                  setUploadOpen(true);
                  requestAnimationFrame(() => fileInputRef.current?.focus());
                }}
              >
                {hasCover ? tDetails("cover.change") : tDetails("cover.add")}
              </Button>
              {hasCover ? (
                <form action={removeAction} className={styles.coverRemoveForm}>
                  <input type="hidden" name="tripId" value={tripId} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="compact"
                    className={styles.coverActionButtonMuted}
                  >
                    {t("remove")}
                  </Button>
                </form>
              ) : null}
            </>
          ) : (
            <form action={uploadAction} className={styles.coverUploadPanel}>
              <input type="hidden" name="tripId" value={tripId} />
              <label className={styles.coverUploadLabel} htmlFor="trip-details-cover-file">
                {t("uploadField")}
              </label>
              <input
                ref={fileInputRef}
                id="trip-details-cover-file"
                name="cover"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={styles.coverFileInput}
              />
              {uploadError ? (
                <p className={styles.inlineError} role="alert">
                  {uploadError}
                </p>
              ) : null}
              {uploadSuccess ? (
                <p className={styles.inlineSuccess}>{uploadSuccess}</p>
              ) : null}
              <div className={styles.coverUploadButtons}>
                <AuthSubmitButton>
                  {hasCover ? t("replaceSubmit") : t("uploadSubmit")}
                </AuthSubmitButton>
                <Button
                  type="button"
                  variant="ghost"
                  size="compact"
                  onClick={() => setUploadOpen(false)}
                >
                  {tCommon("cancel")}
                </Button>
              </div>
            </form>
          )}
          {removeError ? (
            <p className={styles.inlineError} role="alert">
              {removeError}
            </p>
          ) : null}
          {removeSuccess ? (
            <p className={styles.inlineSuccess}>{removeSuccess}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
