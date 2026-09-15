"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { DestinationSearchField } from "@/features/create-trip/DestinationSearchField";
import type { TripDestinationSnapshot } from "@/features/places/resolve-destination-snapshot";
import { buildSettingsHubHref } from "@/features/settings/constants";
import { IconBack } from "@/components/ui/icons";
import { TripCoverSettings } from "@/features/trips/cover/TripCoverSettings";
import { TRIP_ERROR_CODES } from "@/features/trips/constants";
import {
  updateTripDestinationAction,
  updateTripIdentityAction,
  type TripDetailsActionState,
} from "@/features/trips/settings/trip-details-actions";
import styles from "./TripDetailsSettings.module.scss";

export type TripDetailsSettingsViewModel = {
  tripId: string;
  name: string;
  description: string;
  destinationLabel: string;
  dateRangeLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  hasCover: boolean;
  coverVisualKey: string | null;
  isOwner: boolean;
};

function translateFieldError(
  t: ReturnType<typeof useTranslations<"TripDetailsSettings">>,
  code: string | undefined,
): string | null {
  if (!code) {
    return null;
  }
  if (code === TRIP_ERROR_CODES.name) {
    return t("errors.name");
  }
  if (code === "description") {
    return t("errors.description");
  }
  if (code === "invalidDestination") {
    return t("errors.invalidDestination");
  }
  return null;
}

export function TripDetailsSettingsClient({
  model,
}: {
  model: TripDetailsSettingsViewModel;
}) {
  const t = useTranslations("TripDetailsSettings");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [editingIdentity, setEditingIdentity] = useState(false);
  const [editingDestination, setEditingDestination] = useState(false);
  const [destinationSelection, setDestinationSelection] =
    useState<TripDestinationSnapshot | null>(null);
  const [identityState, setIdentityState] = useState<TripDetailsActionState>({});
  const [destinationState, setDestinationState] =
    useState<TripDetailsActionState>({});
  const [identityPending, startIdentityTransition] = useTransition();
  const [destinationPending, startDestinationTransition] = useTransition();

  function submitIdentity(formData: FormData) {
    startIdentityTransition(async () => {
      const result = await updateTripIdentityAction({}, formData);
      setIdentityState(result);
      if (result.ok) {
        setEditingIdentity(false);
        router.refresh();
      }
    });
  }

  function submitDestination(formData: FormData) {
    startDestinationTransition(async () => {
      const result = await updateTripDestinationAction({}, formData);
      setDestinationState(result);
      if (result.ok) {
        setEditingDestination(false);
        setDestinationSelection(null);
        router.refresh();
      }
    });
  }

  const identityNameError = translateFieldError(t, identityState.fieldErrors?.name);
  const identityDescriptionError = translateFieldError(
    t,
    identityState.fieldErrors?.description,
  );
  const destinationError = translateFieldError(
    t,
    destinationState.fieldErrors?.googlePlaceId,
  );

  return (
    <div className={styles.page}>
      <Link href={buildSettingsHubHref(model.tripId)} className={styles.back}>
        <IconBack className={styles.backIcon} aria-hidden />
        <span>{t("back")}</span>
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{t("pageTitle")}</h1>
        <p className={styles.lead}>{t("lead")}</p>
        {!model.isOwner ? (
          <p className={styles.memberHint}>{t("memberReadOnly")}</p>
        ) : null}
      </header>

      <div className={styles.sections}>
        <section className={styles.section} aria-labelledby="trip-details-identity">
          <h2 id="trip-details-identity" className={styles.sectionTitle}>
            {t("sections.identity")}
          </h2>

          {editingIdentity && model.isOwner ? (
            <form
              action={submitIdentity}
              className={styles.form}
            >
              <input type="hidden" name="tripId" value={model.tripId} />
              <Field label={t("fields.name")} htmlFor="trip-details-name">
                <input
                  id="trip-details-name"
                  name="name"
                  type="text"
                  className={styles.input}
                  defaultValue={model.name}
                  required
                  minLength={2}
                  maxLength={80}
                  aria-invalid={identityNameError ? true : undefined}
                  aria-describedby={
                    identityNameError ? "trip-details-name-error" : undefined
                  }
                />
              </Field>
              {identityNameError ? (
                <p id="trip-details-name-error" className={styles.error} role="alert">
                  {identityNameError}
                </p>
              ) : null}

              <Field label={t("fields.description")} htmlFor="trip-details-description">
                <textarea
                  id="trip-details-description"
                  name="description"
                  className={styles.textarea}
                  defaultValue={model.description}
                  maxLength={300}
                  aria-invalid={identityDescriptionError ? true : undefined}
                  aria-describedby={
                    identityDescriptionError
                      ? "trip-details-description-error"
                      : undefined
                  }
                />
              </Field>
              {identityDescriptionError ? (
                <p
                  id="trip-details-description-error"
                  className={styles.error}
                  role="alert"
                >
                  {identityDescriptionError}
                </p>
              ) : null}

              {identityState.error ? (
                <p className={styles.error} role="alert">
                  {t("errors.generic")}
                </p>
              ) : null}

              <div className={styles.actions}>
                <Button type="submit" disabled={identityPending}>
                  {tCommon("save")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="compact"
                  onClick={() => setEditingIdentity(false)}
                >
                  {tCommon("cancel")}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className={styles.fieldBlock}>
                <p className={styles.fieldLabel}>{t("fields.name")}</p>
                <p className={styles.fieldValue} dir="auto">
                  {model.name}
                </p>
              </div>
              <div className={styles.fieldBlock}>
                <p className={styles.fieldLabel}>{t("fields.description")}</p>
                <p
                  className={
                    model.description ? styles.fieldValue : styles.fieldValueMuted
                  }
                  dir="auto"
                >
                  {model.description || t("fields.descriptionEmpty")}
                </p>
              </div>
              {model.isOwner ? (
                <div className={styles.actions}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIdentityState({});
                      setEditingIdentity(true);
                    }}
                  >
                    {tCommon("edit")}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </section>

        <section className={styles.section} aria-labelledby="trip-details-destination">
          <h2 id="trip-details-destination" className={styles.sectionTitle}>
            {t("sections.destination")}
          </h2>

          {editingDestination && model.isOwner ? (
            <>
              <p className={styles.notice}>{t("destinationPreserveNotice")}</p>
              <DestinationSearchField
                selection={destinationSelection}
                onSelectionChange={setDestinationSelection}
              />
              {destinationError ? (
                <p className={styles.error} role="alert">
                  {destinationError}
                </p>
              ) : null}
              {destinationState.error ? (
                <p className={styles.error} role="alert">
                  {t("errors.generic")}
                </p>
              ) : null}
              <form action={submitDestination} className={styles.form}>
                <input type="hidden" name="tripId" value={model.tripId} />
                <input
                  type="hidden"
                  name="googlePlaceId"
                  value={destinationSelection?.googlePlaceId ?? ""}
                />
                <div className={styles.actions}>
                  <Button
                    type="submit"
                    disabled={!destinationSelection || destinationPending}
                  >
                    {tCommon("save")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="compact"
                    onClick={() => {
                      setEditingDestination(false);
                      setDestinationSelection(null);
                    }}
                  >
                    {tCommon("cancel")}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className={styles.fieldBlock}>
                <p className={styles.fieldLabel}>{t("fields.destination")}</p>
                <p className={styles.fieldValue} dir="auto">
                  {model.destinationLabel || t("fields.destinationEmpty")}
                </p>
              </div>
              {model.isOwner ? (
                <div className={styles.actions}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setDestinationState({});
                      setEditingDestination(true);
                    }}
                  >
                    {tCommon("edit")}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </section>

        <section className={styles.section} aria-labelledby="trip-details-schedule">
          <h2 id="trip-details-schedule" className={styles.sectionTitle}>
            {t("sections.schedule")}
          </h2>
          <div className={styles.fieldBlock}>
            <p className={styles.fieldLabel}>{t("fields.dates")}</p>
            <p className={styles.fieldValue}>{model.dateRangeLabel}</p>
          </div>
          <div className={styles.fieldBlock}>
            <p className={styles.fieldLabel}>{t("fields.startDate")}</p>
            <p className={styles.fieldValue}>{model.startDateLabel}</p>
          </div>
          <div className={styles.fieldBlock}>
            <p className={styles.fieldLabel}>{t("fields.endDate")}</p>
            <p className={styles.fieldValue}>{model.endDateLabel}</p>
          </div>
          <p className={styles.notice}>{t("scheduleReadOnly")}</p>
        </section>

        <section
          className={`${styles.section} ${styles.coverSection}`}
          aria-labelledby="trip-details-cover"
        >
          <h2 id="trip-details-cover" className={styles.sectionTitle}>
            {t("sections.cover")}
          </h2>
          <TripCoverSettings
            tripId={model.tripId}
            hasCover={model.hasCover}
            coverVisualKey={model.coverVisualKey}
            isOwner={model.isOwner}
            variant="stack"
          />
        </section>
      </div>
    </div>
  );
}
