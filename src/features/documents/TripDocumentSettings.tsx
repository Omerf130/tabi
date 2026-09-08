"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import {
  TRAVEL_DOCUMENT_CATEGORIES,
  TRAVEL_DOCUMENT_CATEGORY_LABELS,
  TRAVEL_DOCUMENT_MESSAGES,
} from "@/features/documents/constants";
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
  TravelDocumentSettingsViewModel,
} from "@/features/documents/types";
import sectionStyles from "@/features/trips/settings/TripSettingsSections.module.scss";
import styles from "./TripDocumentSettings.module.scss";

const initialState: TravelDocumentActionState = {};

type TripDocumentSettingsProps = {
  tripId: string;
  documents: TravelDocumentSettingsViewModel[];
  activityOptions: ActivityLinkOption[];
  accommodationOptions: AccommodationLinkOption[];
};

type DocumentFormProps = {
  tripId: string;
  document?: TravelDocumentSettingsViewModel;
  activityOptions: ActivityLinkOption[];
  accommodationOptions: AccommodationLinkOption[];
  action: (
    prev: TravelDocumentActionState,
    formData: FormData,
  ) => Promise<TravelDocumentActionState>;
  submitLabel: string;
  includeFile?: boolean;
  onCancel?: () => void;
};

type DocumentRowProps = {
  tripId: string;
  document: TravelDocumentSettingsViewModel;
  activityOptions: ActivityLinkOption[];
  accommodationOptions: AccommodationLinkOption[];
};

function getInitialLinkType(document?: TravelDocumentSettingsViewModel): "none" | "activity" | "accommodation" {
  if (document?.contextLink?.type === "activity") {
    return "activity";
  }
  if (document?.contextLink?.type === "accommodation") {
    return "accommodation";
  }
  return "none";
}

function ContextLinkFields({
  document,
  activityOptions,
  accommodationOptions,
  idPrefix,
  linkType,
  onLinkTypeChange,
}: {
  document?: TravelDocumentSettingsViewModel;
  activityOptions: ActivityLinkOption[];
  accommodationOptions: AccommodationLinkOption[];
  idPrefix: string;
  linkType: "none" | "activity" | "accommodation";
  onLinkTypeChange: (value: "none" | "activity" | "accommodation") => void;
}) {
  return (
    <div className={styles.linkFields}>
      <Field label="קשור אל" htmlFor={`${idPrefix}-link-type`}>
        <select
          id={`${idPrefix}-link-type`}
          name="linkType"
          value={linkType}
          onChange={(event) =>
            onLinkTypeChange(
              event.target.value as "none" | "activity" | "accommodation",
            )
          }
        >
          <option value="none">ללא קישור</option>
          <option value="activity">פעילות</option>
          <option value="accommodation">לינה</option>
        </select>
      </Field>

      {linkType === "activity" ? (
        <Field label="פעילות" htmlFor={`${idPrefix}-activity`}>
          <select
            id={`${idPrefix}-activity`}
            name="activityId"
            defaultValue={document?.contextLink?.type === "activity" ? document.contextLink.activityId : ""}
          >
            <option value="">בחרו פעילות</option>
            {activityOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {linkType === "accommodation" ? (
        <Field label="לינה" htmlFor={`${idPrefix}-accommodation`}>
          <select
            id={`${idPrefix}-accommodation`}
            name="accommodationId"
            defaultValue={
              document?.contextLink?.type === "accommodation"
                ? document.contextLink.accommodationId
                : ""
            }
          >
            <option value="">בחרו מקום לינה</option>
            {accommodationOptions.map((option) => (
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

function DocumentForm({
  tripId,
  document,
  activityOptions,
  accommodationOptions,
  action,
  submitLabel,
  includeFile = false,
  onCancel,
}: DocumentFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [linkType, setLinkType] = useState(getInitialLinkType(document));
  const idPrefix = document ? `edit-${document.id}` : "create";

  return (
    <form action={formAction} className={styles.editForm}>
      <input type="hidden" name="tripId" value={tripId} />
      {document ? <input type="hidden" name="documentId" value={document.id} /> : null}

      {includeFile ? (
        <Field label="קובץ" htmlFor={`${idPrefix}-file`}>
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

      <Field label="כותרת" htmlFor={`${idPrefix}-title`}>
        <Input
          id={`${idPrefix}-title`}
          name="title"
          defaultValue={document?.title ?? ""}
          placeholder={includeFile ? "אופציונלי — יילקח משם הקובץ" : undefined}
          required={!includeFile}
        />
      </Field>

      <Field label="קטגוריה" htmlFor={`${idPrefix}-category`}>
        <select
          id={`${idPrefix}-category`}
          name="category"
          defaultValue={document?.category ?? "other"}
          required
        >
          {TRAVEL_DOCUMENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {TRAVEL_DOCUMENT_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="תיאור (אופציונלי)" htmlFor={`${idPrefix}-description`}>
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
        idPrefix={idPrefix}
        linkType={linkType}
        onLinkTypeChange={setLinkType}
      />

      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? <p className={styles.success}>{state.success}</p> : null}

      <div className={styles.rowActions}>
        <AuthSubmitButton>{submitLabel}</AuthSubmitButton>
        {onCancel ? (
          <Button type="button" variant="ghost" size="compact" onClick={onCancel}>
            ביטול
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
}: DocumentRowProps) {
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
        <DocumentForm
          tripId={tripId}
          document={travelDocument}
          activityOptions={activityOptions}
          accommodationOptions={accommodationOptions}
          action={updateTravelDocumentAction}
          submitLabel="שמירה"
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  function handleDelete() {
    if (!window.confirm(TRAVEL_DOCUMENT_MESSAGES.deleteConfirm)) {
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
          עריכה
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="compact"
          onClick={() => setReplacing((value) => !value)}
        >
          החלפת קובץ
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="compact"
          onClick={handleDelete}
        >
          מחיקה
        </Button>
      </div>

      {replacing ? (
        <form action={replaceAction} className={styles.replaceForm}>
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="documentId" value={travelDocument.id} />
          <Field label="קובץ חדש" htmlFor={`replace-${travelDocument.id}`}>
            <input
              id={`replace-${travelDocument.id}`}
              name="file"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className={styles.fileInput}
              required
            />
          </Field>
          {replaceState.error ? (
            <p className={styles.error} role="alert">
              {replaceState.error}
            </p>
          ) : null}
          {replaceState.success ? (
            <p className={styles.success}>{replaceState.success}</p>
          ) : null}
          <AuthSubmitButton>החלפה</AuthSubmitButton>
        </form>
      ) : null}

      <form id={`delete-document-${travelDocument.id}`} action={deleteAction} hidden>
        <input type="hidden" name="tripId" value={tripId} />
        <input type="hidden" name="documentId" value={travelDocument.id} />
      </form>
      {deleteState.error ? (
        <p className={styles.error} role="alert">
          {deleteState.error}
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
}: TripDocumentSettingsProps) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <section
      id="documents"
      className={sectionStyles.section}
      aria-labelledby="trip-documents-title"
    >
      <div className={sectionStyles.header}>
        <h2 id="trip-documents-title" className={sectionStyles.title}>
          מסמכים
        </h2>
        <p className={sectionStyles.hint}>
          כרטיסי טיסה, הזמנות, ביטוחים ומסמכים חשובים — זמינים לכל מי שבטיול.
        </p>
      </div>

      {!showCreate ? (
        <Button type="button" variant="ghost" onClick={() => setShowCreate(true)}>
          + הוספת מסמך
        </Button>
      ) : (
        <div className={styles.createForm}>
          <p className={styles.createLabel}>הוספת מסמך</p>
          <DocumentForm
            tripId={tripId}
            activityOptions={activityOptions}
            accommodationOptions={accommodationOptions}
            action={createTravelDocumentAction}
            submitLabel="הוספה"
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
            />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>אין מסמכים עדיין.</p>
      )}
    </section>
  );
}
