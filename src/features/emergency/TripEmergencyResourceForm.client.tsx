"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import {
  createTripEmergencyResourceAction,
  updateTripEmergencyResourceAction,
  type TripEmergencyResourceActionState,
} from "./actions";
import { createEmergencyCategoryLabelResolver } from "./emergency-labels";
import { EMERGENCY_CUSTOM_CATEGORIES } from "./types";
import { translateEmergencyError } from "./translate-emergency-error";
import type { TripEmergencyResourceViewModel } from "./types";
import styles from "./EmergencyPage.module.scss";

const initialState: TripEmergencyResourceActionState = {};

type TripEmergencyResourceFormProps = {
  tripId: string;
  resource?: TripEmergencyResourceViewModel;
  onCancel?: () => void;
};

export function TripEmergencyResourceForm({
  tripId,
  resource,
  onCancel,
}: TripEmergencyResourceFormProps) {
  const t = useTranslations("Emergency");
  const resolveCategoryLabel = useMemo(
    () => createEmergencyCategoryLabelResolver(t),
    [t],
  );
  const router = useRouter();
  const action = resource
    ? updateTripEmergencyResourceAction
    : createTripEmergencyResourceAction;
  const [state, formAction] = useActionState(action, initialState);
  const idPrefix = resource ? `edit-${resource.id}` : "create";
  const errorMessage = translateEmergencyError(t, state.errorCode);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
      onCancel?.();
    }
  }, [state.ok, router, onCancel]);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="tripId" value={tripId} />
      {resource ? <input type="hidden" name="resourceId" value={resource.id} /> : null}

      <Field label={t("form.title")} htmlFor={`${idPrefix}-title`}>
        <Input
          id={`${idPrefix}-title`}
          name="title"
          defaultValue={resource?.title ?? ""}
          required
        />
      </Field>

      <Field label={t("form.category")} htmlFor={`${idPrefix}-category`}>
        <select
          id={`${idPrefix}-category`}
          name="category"
          defaultValue={resource?.category ?? "other"}
          required
        >
          {EMERGENCY_CUSTOM_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {resolveCategoryLabel(category)}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("form.phoneOptional")} htmlFor={`${idPrefix}-phone`}>
        <Input id={`${idPrefix}-phone`} name="phone" defaultValue={resource?.phone ?? ""} />
      </Field>

      <Field label={t("form.secondaryPhoneOptional")} htmlFor={`${idPrefix}-secondary-phone`}>
        <Input
          id={`${idPrefix}-secondary-phone`}
          name="secondaryPhone"
          defaultValue={resource?.secondaryPhone ?? ""}
        />
      </Field>

      <Field label={t("form.emailOptional")} htmlFor={`${idPrefix}-email`}>
        <Input id={`${idPrefix}-email`} name="email" defaultValue={resource?.email ?? ""} />
      </Field>

      <Field label={t("form.addressOptional")} htmlFor={`${idPrefix}-address`}>
        <Input id={`${idPrefix}-address`} name="address" defaultValue={resource?.address ?? ""} />
      </Field>

      <Field label={t("form.websiteOptional")} htmlFor={`${idPrefix}-url`}>
        <Input id={`${idPrefix}-url`} name="url" defaultValue={resource?.url ?? ""} />
      </Field>

      <Field label={t("form.referenceOptional")} htmlFor={`${idPrefix}-reference`}>
        <Input
          id={`${idPrefix}-reference`}
          name="reference"
          defaultValue={resource?.reference ?? ""}
        />
      </Field>

      <Field label={t("form.notesOptional")} htmlFor={`${idPrefix}-notes`}>
        <Textarea
          id={`${idPrefix}-notes`}
          name="notes"
          defaultValue={resource?.notes ?? ""}
          rows={3}
        />
      </Field>

      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className={styles.formActions}>
        <AuthSubmitButton>{t("saveResource")}</AuthSubmitButton>
        {onCancel ? (
          <Button type="button" variant="ghost" size="compact" onClick={onCancel}>
            {t("cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
