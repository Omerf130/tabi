"use client";



import { useState, useTransition } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button/Button";

import {

  IconCalendar,

  IconDictionary,

  IconMapPin,

  IconMembers,

  IconTrips,

  IconBack,

} from "@/components/ui/icons";

import { DestinationSearchField } from "@/features/create-trip/DestinationSearchField";

import { TripDateRangeCalendar } from "@/features/create-trip/TripDateRangeCalendar";

import type { TripDestinationSnapshot } from "@/features/places/resolve-destination-snapshot";

import { buildSettingsHubHref } from "@/features/settings/constants";

import { TRIP_ERROR_CODES } from "@/features/trips/constants";

import {

  updateTripDestinationAction,

  updateTripIdentityAction,

  type TripDetailsActionState,

} from "@/features/trips/settings/trip-details-actions";

import { TRIP_DATE_CHANGE_ERROR_CODES } from "@/features/trips/trip-date-change/constants";

import {

  applyTripDateChangeAction,

  previewTripDateChangeAction,

  type TripDateChangeActionState,

} from "@/features/trips/trip-date-change/trip-date-change-actions";

import type { TripDateChangePreviewResult } from "@/features/trips/trip-date-change/trip-date-change-types";

import { TripDateChangeConfirmDialog } from "./TripDateChangeConfirmDialog.client";

import { TripDetailsCoverHero } from "./TripDetailsCoverHero.client";

import { TripDetailsEditSheet } from "./TripDetailsEditSheet.client";

import { TripDetailsSettingsRow } from "./TripDetailsSettingsRow";

import styles from "./TripDetailsSettings.module.scss";



export type TripDetailsSettingsViewModel = {

  tripId: string;

  name: string;

  description: string;

  destinationLabel: string;

  startDate: string;

  endDate: string;

  dateRangeLabel: string;

  hasCover: boolean;

  coverVisualKey: string | null;

  isOwner: boolean;

  memberCount: number;

  travelersHref: string;

};



type Editor = null | "identity" | "destination" | "dates";



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



  const [activeEditor, setActiveEditor] = useState<Editor>(null);

  const [destinationSelection, setDestinationSelection] =

    useState<TripDestinationSnapshot | null>(null);

  const [identityState, setIdentityState] = useState<TripDetailsActionState>({});

  const [destinationState, setDestinationState] =

    useState<TripDetailsActionState>({});

  const [identityPending, startIdentityTransition] = useTransition();

  const [destinationPending, startDestinationTransition] = useTransition();

  const [draftStartDate, setDraftStartDate] = useState(model.startDate);

  const [draftEndDate, setDraftEndDate] = useState(model.endDate);

  const [dateChangeState, setDateChangeState] = useState<TripDateChangeActionState>(

    {},

  );

  const [pendingPreview, setPendingPreview] =

    useState<TripDateChangePreviewResult | null>(null);

  const [datePreviewPending, startDatePreviewTransition] = useTransition();

  const [dateApplyPending, startDateApplyTransition] = useTransition();

  const [dateSuccess, setDateSuccess] = useState(false);



  const tDateChange = useTranslations("TripDetailsSettings.dateChange");



  const openEditor = (editor: Editor) => {

    if (!model.isOwner) {

      return;

    }

    setIdentityState({});

    setDestinationState({});

    setDateChangeState({});

    if (editor === "dates") {

      setDateSuccess(false);

      setDraftStartDate(model.startDate);

      setDraftEndDate(model.endDate);

    }

    if (editor === "destination") {

      setDestinationSelection(null);

    }

    setActiveEditor(editor);

  };



  const closeEditor = () => {

    setActiveEditor(null);

    setDestinationSelection(null);

    setDraftStartDate(model.startDate);

    setDraftEndDate(model.endDate);

    setDateChangeState({});

  };



  function submitIdentity(formData: FormData) {

    startIdentityTransition(async () => {

      const result = await updateTripIdentityAction({}, formData);

      setIdentityState(result);

      if (result.ok) {

        setActiveEditor(null);

        router.refresh();

      }

    });

  }



  function translateDateChangeError(code: string | undefined): string | null {

    if (!code) {

      return null;

    }

    if (code === TRIP_DATE_CHANGE_ERROR_CODES.noChange) {

      return tDateChange("errors.noChange");

    }

    if (code === TRIP_DATE_CHANGE_ERROR_CODES.stalePreview) {

      return tDateChange("errors.stalePreview");

    }

    if (code === TRIP_ERROR_CODES.startDate) {

      return t("errors.startDate");

    }

    if (

      code === TRIP_ERROR_CODES.endDate ||

      code === TRIP_ERROR_CODES.dateOrder ||

      code === TRIP_ERROR_CODES.maxDuration

    ) {

      return t("errors.endDate");

    }

    return tDateChange("errors.generic");

  }



  function runApply(previewToken: string) {

    startDateApplyTransition(async () => {

      const formData = new FormData();

      formData.set("tripId", model.tripId);

      formData.set("previewToken", previewToken);

      const result = await applyTripDateChangeAction({}, formData);

      setDateChangeState(result);

      if (result.ok) {

        setPendingPreview(null);

        setActiveEditor(null);

        setDateSuccess(true);

        router.refresh();

      }

    });

  }



  function submitDatePreview() {

    startDatePreviewTransition(async () => {

      const formData = new FormData();

      formData.set("tripId", model.tripId);

      formData.set("startDate", draftStartDate);

      formData.set("endDate", draftEndDate);

      const result = await previewTripDateChangeAction({}, formData);

      setDateChangeState(result);

      if (result.preview) {

        if (!result.preview.requiresConfirmation) {

          runApply(result.preview.previewToken);

          return;

        }

        setPendingPreview(result.preview);

      }

    });

  }



  function submitDestination(formData: FormData) {

    startDestinationTransition(async () => {

      const result = await updateTripDestinationAction({}, formData);

      setDestinationState(result);

      if (result.ok) {

        setActiveEditor(null);

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



  const descriptionDisplay = model.description.trim()

    ? model.description

    : t("fields.descriptionEmpty");

  const destinationDisplay = model.destinationLabel.trim()

    ? model.destinationLabel

    : t("fields.destinationEmpty");



  const travelersSubtitle = t("travelers.subtitle", { count: model.memberCount });



  const rowIconClass = styles.rowIconSvg;



  return (

    <div className={styles.page}>

      <Link href={buildSettingsHubHref(model.tripId)} className={styles.back}>

        <IconBack className={styles.backIcon} aria-hidden />

        <span>{t("back")}</span>

      </Link>



      <header className={styles.header}>

        <h1 className={styles.title}>{t("pageTitle")}</h1>

        <p className={styles.lead}>{t("lead")}</p>

      </header>



      <TripDetailsCoverHero

        tripId={model.tripId}

        hasCover={model.hasCover}

        coverVisualKey={model.coverVisualKey}

        isOwner={model.isOwner}

      />



      {!model.isOwner ? (

        <p className={styles.memberBanner}>{t("memberReadOnly")}</p>

      ) : null}



      {dateSuccess ? (

        <p className={styles.statusToast} role="status">

          {tDateChange("success")}

        </p>

      ) : null}



      <div>

        <h2 className={styles.sectionLabel}>{t("sections.tripInformation")}</h2>

        <div className={styles.group} role="list">

          <TripDetailsSettingsRow

            label={t("fields.name")}

            value={model.name}

            icon={<IconTrips className={rowIconClass} />}

            onPress={model.isOwner ? () => openEditor("identity") : undefined}

            showChevron={model.isOwner}

          />

          <TripDetailsSettingsRow

            label={t("fields.description")}

            value={descriptionDisplay}

            valueMuted={!model.description.trim()}

            icon={<IconDictionary className={rowIconClass} />}

            onPress={model.isOwner ? () => openEditor("identity") : undefined}

            showChevron={model.isOwner}

          />

          <TripDetailsSettingsRow

            label={t("fields.destination")}

            value={destinationDisplay}

            valueMuted={!model.destinationLabel.trim()}

            icon={<IconMapPin className={rowIconClass} />}

            onPress={model.isOwner ? () => openEditor("destination") : undefined}

            showChevron={model.isOwner}

          />

          <TripDetailsSettingsRow

            label={t("fields.dates")}

            value={model.dateRangeLabel}

            icon={<IconCalendar className={rowIconClass} />}

            onPress={model.isOwner ? () => openEditor("dates") : undefined}

            showChevron={model.isOwner}

            dir="ltr"

          />

        </div>

      </div>



      <div>

        <h2 className={styles.sectionLabel}>{t("travelers.section")}</h2>

        <div className={styles.group}>

          <TripDetailsSettingsRow

            label={t("travelers.title")}

            value={travelersSubtitle}

            icon={<IconMembers className={rowIconClass} />}

            href={model.travelersHref}

            showChevron

          />

        </div>

      </div>



      <TripDetailsEditSheet

        open={activeEditor === "identity"}

        title={t("edit.identityTitle")}

        onClose={closeEditor}

        footer={

          <>

            <Button type="submit" form="trip-details-identity-form" disabled={identityPending}>

              {tCommon("save")}

            </Button>

            <Button type="button" variant="ghost" onClick={closeEditor}>

              {tCommon("cancel")}

            </Button>

          </>

        }

      >

        <form id="trip-details-identity-form" action={submitIdentity}>

          <input type="hidden" name="tripId" value={model.tripId} />

          <div className={styles.formField}>

            <label className={styles.formLabel} htmlFor="trip-details-name">

              {t("fields.name")}

            </label>

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

            />

            {identityNameError ? (

              <p className={styles.inlineError} role="alert">

                {identityNameError}

              </p>

            ) : null}

          </div>

          <div className={styles.formField}>

            <label className={styles.formLabel} htmlFor="trip-details-description">

              {t("fields.description")}

            </label>

            <textarea

              id="trip-details-description"

              name="description"

              className={styles.textarea}

              defaultValue={model.description}

              maxLength={300}

              placeholder={t("fields.descriptionPlaceholder")}

              aria-invalid={identityDescriptionError ? true : undefined}

            />

            {identityDescriptionError ? (

              <p className={styles.inlineError} role="alert">

                {identityDescriptionError}

              </p>

            ) : null}

          </div>

          {identityState.error ? (

            <p className={styles.inlineError} role="alert">

              {t("errors.generic")}

            </p>

          ) : null}

        </form>

      </TripDetailsEditSheet>



      <TripDetailsEditSheet

        open={activeEditor === "destination"}

        title={t("edit.destinationTitle")}

        onClose={closeEditor}

        footer={

          <form action={submitDestination} className={styles.sheetFooterStack}>

            <input type="hidden" name="tripId" value={model.tripId} />

            <input

              type="hidden"

              name="googlePlaceId"

              value={destinationSelection?.googlePlaceId ?? ""}

            />

            <Button type="submit" disabled={!destinationSelection || destinationPending}>

              {tCommon("save")}

            </Button>

            <Button type="button" variant="ghost" onClick={closeEditor}>

              {tCommon("cancel")}

            </Button>

          </form>

        }

      >

        <p className={styles.notice}>{t("destinationPreserveNotice")}</p>

        <DestinationSearchField

          selection={destinationSelection}

          onSelectionChange={setDestinationSelection}

        />

        {destinationError ? (

          <p className={styles.inlineError} role="alert">

            {destinationError}

          </p>

        ) : null}

        {destinationState.error ? (

          <p className={styles.inlineError} role="alert">

            {t("errors.generic")}

          </p>

        ) : null}

      </TripDetailsEditSheet>



      <TripDetailsEditSheet

        open={activeEditor === "dates"}

        title={tDateChange("editDates")}

        onClose={closeEditor}

        footer={

          <div className={styles.sheetFooterStack}>

            <Button

              type="button"

              disabled={datePreviewPending || dateApplyPending}

              onClick={submitDatePreview}

            >

              {tDateChange("continue")}

            </Button>

            <Button type="button" variant="ghost" onClick={closeEditor}>

              {tCommon("cancel")}

            </Button>

          </div>

        }

      >

        <div className={styles.dateSheetCurrent}>

          <p className={styles.dateSheetCurrentLabel}>{tDateChange("currentRangeLabel")}</p>

          <p className={styles.dateSheetCurrentValue} dir="ltr">

            {model.dateRangeLabel}

          </p>

        </div>

        <TripDateRangeCalendar

          variant="settings"

          startDate={draftStartDate}

          endDate={draftEndDate}

          onRangeChange={({ startDate, endDate }) => {

            setDraftStartDate(startDate);

            setDraftEndDate(endDate);

          }}

        />

        {dateChangeState.fieldErrors?.startDate ? (

          <p className={styles.inlineError} role="alert">

            {translateDateChangeError(dateChangeState.fieldErrors.startDate)}

          </p>

        ) : null}

        {dateChangeState.fieldErrors?.endDate ? (

          <p className={styles.inlineError} role="alert">

            {translateDateChangeError(dateChangeState.fieldErrors.endDate)}

          </p>

        ) : null}

        {dateChangeState.error ? (

          <p className={styles.inlineError} role="alert">

            {translateDateChangeError(dateChangeState.error)}

          </p>

        ) : null}

      </TripDetailsEditSheet>



      {pendingPreview ? (

        <TripDateChangeConfirmDialog

          impact={pendingPreview.impact}

          previewToken={pendingPreview.previewToken}

          tripId={model.tripId}

          isApplying={dateApplyPending}

          applyError={

            dateChangeState.error

              ? translateDateChangeError(dateChangeState.error)

              : null

          }

          onCancel={() => {

            setPendingPreview(null);

            setDateChangeState({});

          }}

          onConfirm={(formData) => {

            const token = String(formData.get("previewToken") ?? "");

            runApply(token);

          }}

        />

      ) : null}

    </div>

  );

}


