"use client";

import { useActionState, useEffect } from "react";
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
import { EMERGENCY_CUSTOM_CATEGORY_LABELS, EMERGENCY_MESSAGES } from "./constants";
import { EMERGENCY_CUSTOM_CATEGORIES } from "./types";
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
  const router = useRouter();
  const action = resource
    ? updateTripEmergencyResourceAction
    : createTripEmergencyResourceAction;
  const [state, formAction] = useActionState(action, initialState);
  const idPrefix = resource ? `edit-${resource.id}` : "create";

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

      <Field label="כותרת" htmlFor={`${idPrefix}-title`}>
        <Input
          id={`${idPrefix}-title`}
          name="title"
          defaultValue={resource?.title ?? ""}
          required
        />
      </Field>

      <Field label="קטגוריה" htmlFor={`${idPrefix}-category`}>
        <select
          id={`${idPrefix}-category`}
          name="category"
          defaultValue={resource?.category ?? "other"}
          required
        >
          {EMERGENCY_CUSTOM_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {EMERGENCY_CUSTOM_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="טלפון (אופציונלי)" htmlFor={`${idPrefix}-phone`}>
        <Input id={`${idPrefix}-phone`} name="phone" defaultValue={resource?.phone ?? ""} />
      </Field>

      <Field label="טלפון נוסף (אופציונלי)" htmlFor={`${idPrefix}-secondary-phone`}>
        <Input
          id={`${idPrefix}-secondary-phone`}
          name="secondaryPhone"
          defaultValue={resource?.secondaryPhone ?? ""}
        />
      </Field>

      <Field label="אימייל (אופציונלי)" htmlFor={`${idPrefix}-email`}>
        <Input id={`${idPrefix}-email`} name="email" defaultValue={resource?.email ?? ""} />
      </Field>

      <Field label="כתובת (אופציונלי)" htmlFor={`${idPrefix}-address`}>
        <Input id={`${idPrefix}-address`} name="address" defaultValue={resource?.address ?? ""} />
      </Field>

      <Field label="אתר (אופציונלי)" htmlFor={`${idPrefix}-url`}>
        <Input id={`${idPrefix}-url`} name="url" defaultValue={resource?.url ?? ""} />
      </Field>

      <Field label="מספר/אסמכתא (אופציונלי)" htmlFor={`${idPrefix}-reference`}>
        <Input
          id={`${idPrefix}-reference`}
          name="reference"
          defaultValue={resource?.reference ?? ""}
        />
      </Field>

      <Field label="הערות (אופציונלי)" htmlFor={`${idPrefix}-notes`}>
        <Textarea
          id={`${idPrefix}-notes`}
          name="notes"
          defaultValue={resource?.notes ?? ""}
          rows={3}
        />
      </Field>

      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}

      <div className={styles.formActions}>
        <AuthSubmitButton>{EMERGENCY_MESSAGES.saveResource}</AuthSubmitButton>
        {onCancel ? (
          <Button type="button" variant="ghost" size="compact" onClick={onCancel}>
            {EMERGENCY_MESSAGES.cancel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
