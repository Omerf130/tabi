"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import overlayStyles from "@/features/itinerary/AddItemFlow.module.scss";
import { TRAVEL_DOCUMENT_CATEGORIES } from "@/features/documents/constants";
import { createTravelDocumentCategoryLabelResolver } from "@/features/documents/document-labels";
import {
  translateDocumentError,
  translateDocumentSuccess,
} from "@/features/documents/translate-document-error";
import {
  createTravelDocumentAction,
  deleteTravelDocumentAction,
  replaceTravelDocumentFileAction,
  updateTravelDocumentAction,
  type TravelDocumentActionState,
} from "@/features/documents/actions";
import type {
  AccommodationLinkOption,
  ActivityLinkOption,
  TransportLinkOption,
  TravelDocumentSettingsViewModel,
} from "@/features/documents/types";
import {
  getTripSettingsSectionClassName,
  type TripSettingsVariant,
} from "@/features/trips/settings/section-variant";
import sectionStyles from "@/features/trips/settings/TripSettingsSections.module.scss";
import styles from "./TripDocumentSettings.module.scss";

const initialState: TravelDocumentActionState = {};

type TripDocumentSettingsProps = {
  tripId: string;
  documents: TravelDocumentSettingsViewModel[];
  activityOptions: ActivityLinkOption[];
  accommodationOptions: AccommodationLinkOption[];
  transportOptions: TransportLinkOption[];
  variant?: TripSettingsVariant;
};

type DocumentFormProps = {
  tripId: string;
  document?: TravelDocumentSettingsViewModel;
  activityOptions: ActivityLinkOption[];
  accommodationOptions: AccommodationLinkOption[];
  transportOptions: TransportLinkOption[];
  action: (
    prev: TravelDocumentActionState,
    formData: FormData,
  ) => Promise<TravelDocumentActionState>;
  submitLabel: string;
  includeFile?: boolean;
  initialLinkType?: DocumentLinkType;
  initialActivityId?: string;
  initialAccommodationId?: string;
  initialTransportId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  /** Sticky overlay footer for Quick Add / sheet embeds only. */
  overlayActionFooter?: boolean;
};

type DocumentRowProps = {
  tripId: string;
  document: TravelDocumentSettingsViewModel;
  activityOptions: ActivityLinkOption[];
  accommodationOptions: AccommodationLinkOption[];
  transportOptions: TransportLinkOption[];
};

type DocumentLinkType = "none" | "activity" | "accommodation" | "transport";

function getInitialLinkType(document?: TravelDocumentSettingsViewModel): DocumentLinkType {
  if (document?.contextLink?.type === "activity") {
    return "activity";
  }
  if (document?.contextLink?.type === "accommodation") {
    return "accommodation";
  }
  if (document?.contextLink?.type === "transport") {
    return "transport";
  }
  return "none";
}

function ContextLinkFields({
  document,
  activityOptions,
  accommodationOptions,
  transportOptions,
  idPrefix,
  linkType,
  onLinkTypeChange,
  initialActivityId,
  initialAccommodationId,
  initialTransportId,
  t,
}: {
  document?: TravelDocumentSettingsViewModel;
  activityOptions: ActivityLinkOption[];
  accommodationOptions: AccommodationLinkOption[];
  transportOptions: TransportLinkOption[];
  idPrefix: string;
  linkType: DocumentLinkType;
  onLinkTypeChange: (value: DocumentLinkType) => void;
  initialActivityId?: string;
  initialAccommodationId?: string;
  initialTransportId?: string;
  t: ReturnType<typeof useTranslations<"Documents">>;
}) {
  return (
    <div className={styles.linkFields}>
      <Field label={t("linkedTo")} htmlFor={`${idPrefix}-link-type`}>
        <select
          id={`${idPrefix}-link-type`}
          name="linkType"
          value={linkType}
          onChange={(event) =>
            onLinkTypeChange(event.target.value as DocumentLinkType)
          }
        >
          <option value="none">{t("linkNone")}</option>
          <option value="activity">{t("linkActivity")}</option>
          <option value="accommodation">{t("linkAccommodation")}</option>
          <option value="transport">{t("linkTransport")}</option>
        </select>
      </Field>

      {linkType === "activity" ? (
        <Field label={t("linkActivity")} htmlFor={`${idPrefix}-activity`}>
          <select
            id={`${idPrefix}-activity`}
            name="activityId"
            defaultValue={
              document?.contextLink?.type === "activity"
                ? document.contextLink.activityId
                : initialActivityId ?? ""
            }
          >
            <option value="">{t("selectActivity")}</option>
            {activityOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {linkType === "accommodation" ? (
        <Field label={t("linkAccommodation")} htmlFor={`${idPrefix}-accommodation`}>
          <select
            id={`${idPrefix}-accommodation`}
            name="accommodationId"
            defaultValue={
              document?.contextLink?.type === "accommodation"
                ? document.contextLink.accommodationId
                : initialAccommodationId ?? ""
            }
          >
            <option value="">{t("selectAccommodation")}</option>
            {accommodationOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {linkType === "transport" ? (
        <Field label={t("linkTransport")} htmlFor={`${idPrefix}-transport`}>
          <select
            id={`${idPrefix}-transport`}
            name="transportId"
            defaultValue={
              document?.contextLink?.type === "transport"
                ? document.contextLink.transportId
                : initialTransportId ?? ""
            }
          >
            <option value="">{t("selectTransport")}</option>
            {transportOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
    </div>
  );
}

export function TripDocumentForm({
  tripId,
  document,
  activityOptions,
  accommodationOptions,
  transportOptions,
  action,
  submitLabel,
  includeFile = false,
  initialLinkType,
  initialActivityId,
  initialAccommodationId,
  initialTransportId,
  onCancel,
  onSuccess,
  overlayActionFooter = false,
}: DocumentFormProps) {
  const t = useTranslations("Documents");
  const tCommon = useTranslations("Common");
  const resolveCategoryLabel = useMemo(
    () => createTravelDocumentCategoryLabelResolver(t),
    [t],
  );
  const router = useRouter();
  const [state, formAction] = useActionState(action, initialState);
  const errorMessage = translateDocumentError(t, state.errorCode);
  const successMessage = translateDocumentSuccess(t, state.successCode);
  const [linkType, setLinkType] = useState<DocumentLinkType>(
    document ? getInitialLinkType(document) : initialLinkType ?? "none",
  );
  const idPrefix = document ? `edit-${document.id}` : "create";

  useEffect(() => {
    if (state.ok) {
      onSuccess?.();
      router.refresh();
    }
  }, [onSuccess, router, state.ok]);

  return (
    <form action={formAction} className={styles.editForm}>
      <input type="hidden" name="tripId" value={tripId} />
      {document ? <input type="hidden" name="documentId" value={document.id} /> : null}

      {includeFile ? (
        <Field label={t("file")} htmlFor={`${idPrefix}-file`}>
          <input
            id={`${idPrefix}-file`}
            name="file"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className={styles.fileInput}
            required
          />
        </Field>
      ) : null}

      <Field label={t("title")} htmlFor={`${idPrefix}-title`}>
        <Input
          id={`${idPrefix}-title`}
          name="title"
          defaultValue={document?.title ?? ""}
          placeholder={includeFile ? t("titlePlaceholder") : undefined}
          required={!includeFile}
        />
      </Field>

      <Field label={t("category")} htmlFor={`${idPrefix}-category`}>
        <select
          id={`${idPrefix}-category`}
          name="category"
          defaultValue={document?.category ?? "other"}
          required
        >
          {TRAVEL_DOCUMENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {resolveCategoryLabel(category)}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("descriptionOptional")} htmlFor={`${idPrefix}-description`}>
        <Textarea
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={document?.description ?? ""}
          rows={3}
        />
      </Field>

      <ContextLinkFields
        document={document}
        activityOptions={activityOptions}
        accommodationOptions={accommodationOptions}
        transportOptions={transportOptions}
        idPrefix={idPrefix}
        linkType={linkType}
        onLinkTypeChange={setLinkType}
        initialActivityId={initialActivityId}
        initialAccommodationId={initialAccommodationId}
        initialTransportId={initialTransportId}
        t={t}
      />

      <Field label={t("emergency")} htmlFor={`${idPrefix}-show-in-emergency`}>
        <label className={styles.checkboxRow}>
          <input
            id={`${idPrefix}-show-in-emergency`}
            name="showInEmergency"
            type="checkbox"
            value="true"
            defaultChecked={document?.showInEmergency ?? false}
          />
          <span>{t("showInEmergency")}</span>
        </label>
      </Field>

      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}
      {successMessage ? <p className={styles.success}>{successMessage}</p> : null}

      <div
        className={
          overlayActionFooter ? overlayStyles.plannerFooter : styles.rowActions
        }
      >
        <AuthSubmitButton>{submitLabel}</AuthSubmitButton>
        {onCancel ? (
          <Button type="button" variant="ghost" size="compact" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function DocumentRow({
  tripId,
  document: travelDocument,
  activityOptions,
  accommodationOptions,
  transportOptions,
}: DocumentRowProps) {
  const t = useTranslations("Documents");
  const tCommon = useTranslations("Common");
  const [editing, setEditing] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [deleteState, deleteAction] = useActionState(
    deleteTravelDocumentAction,
    initialState,
  );
  const [replaceState, replaceAction] = useActionState(
    replaceTravelDocumentFileAction,
    initialState,
  );

  if (editing) {
    return (
      <li className={styles.item}>
        <TripDocumentForm
          tripId={tripId}
          document={travelDocument}
          activityOptions={activityOptions}
          accommodationOptions={accommodationOptions}
          transportOptions={transportOptions}
          action={updateTravelDocumentAction}
          submitLabel={t("saveSubmit")}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  function handleDelete() {
    if (!window.confirm(t("errors.deleteConfirm"))) {
      return;
    }
    const form = window.document.getElementById(
      `delete-document-${travelDocument.id}`,
    ) as HTMLFormElement | null;
    form?.requestSubmit();
  }

  return (
    <li className={styles.item}>
      <div className={styles.itemBody}>
        <p className={styles.itemTitle} dir="auto">
          {travelDocument.title}
        </p>
        <p className={styles.itemMeta}>
          {travelDocument.categoryLabel} · {travelDocument.fileTypeLabel}
        </p>
      </div>

      <div className={styles.rowActions}>
        <Button
          type="button"
          variant="ghost"
          size="compact"
          onClick={() => setEditing(true)}
        >
          {t("edit")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="compact"
          onClick={() => setReplacing((value) => !value)}
        >
          {t("replaceFile")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="compact"
          onClick={handleDelete}
        >
          {tCommon("delete")}
        </Button>
      </div>

      {replacing ? (
        <form action={replaceAction} className={styles.replaceForm}>
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="documentId" value={travelDocument.id} />
          <Field label={t("newFile")} htmlFor={`replace-${travelDocument.id}`}>
            <input
              id={`replace-${travelDocument.id}`}
              name="file"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className={styles.fileInput}
              required
            />
          </Field>
          {replaceState.errorCode ? (
            <p className={styles.error} role="alert">
              {translateDocumentError(t, replaceState.errorCode)}
            </p>
          ) : null}
          {replaceState.successCode ? (
            <p className={styles.success}>
              {translateDocumentSuccess(t, replaceState.successCode)}
            </p>
          ) : null}
          <AuthSubmitButton>{t("replaceSubmit")}</AuthSubmitButton>
        </form>
      ) : null}

      <form id={`delete-document-${travelDocument.id}`} action={deleteAction} hidden>
        <input type="hidden" name="tripId" value={tripId} />
        <input type="hidden" name="documentId" value={travelDocument.id} />
      </form>
      {deleteState.errorCode ? (
        <p className={styles.error} role="alert">
          {translateDocumentError(t, deleteState.errorCode)}
        </p>
      ) : null}
    </li>
  );
}

export function TripDocumentSettings({
  tripId,
  documents,
  activityOptions,
  accommodationOptions,
  transportOptions,
  variant = "stack",
}: TripDocumentSettingsProps) {
  const t = useTranslations("Documents");
  const [showCreate, setShowCreate] = useState(false);

  return (
    <section
      id="documents"
      className={getTripSettingsSectionClassName(variant)}
      aria-labelledby="trip-documents-title"
    >
      <div className={sectionStyles.header}>
        <h2 id="trip-documents-title" className={sectionStyles.title}>
          {t("settingsTitle")}
        </h2>
        <p className={sectionStyles.hint}>{t("settingsHint")}</p>
      </div>

      {!showCreate ? (
        <Button type="button" variant="ghost" onClick={() => setShowCreate(true)}>
          {t("addDocument")}
        </Button>
      ) : (
        <div className={styles.createForm}>
          <p className={styles.createLabel}>{t("addDocumentLabel")}</p>
          <TripDocumentForm
            tripId={tripId}
            activityOptions={activityOptions}
            accommodationOptions={accommodationOptions}
            transportOptions={transportOptions}
            action={createTravelDocumentAction}
            submitLabel={t("addSubmit")}
            includeFile
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {documents.length > 0 ? (
        <ul className={styles.list}>
          {documents.map((document) => (
            <DocumentRow
              key={document.id}
              tripId={tripId}
              document={document}
              activityOptions={activityOptions}
              accommodationOptions={accommodationOptions}
              transportOptions={transportOptions}
            />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{t("emptySettings")}</p>
      )}
    </section>
  );
}
