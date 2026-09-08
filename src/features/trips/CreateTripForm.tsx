"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { AuthSubmitButton } from "@/features/auth/AuthSubmitButton";
import { createTripAction, type TripActionState } from "./actions";
import styles from "./Trips.module.scss";

const initialState: TripActionState = {};

export function CreateTripForm() {
  const [state, action] = useActionState(createTripAction, initialState);

  return (
    <form action={action} className={styles.form}>
      {state.error ? (
        <p className={styles.formError} role="alert">
          {state.error}
        </p>
      ) : null}
      <Field label="שם הטיול" htmlFor="name" error={state.fieldErrors?.name}>
        <Input
          id="name"
          name="name"
          autoComplete="off"
          required
          minLength={2}
          maxLength={80}
          aria-invalid={state.fieldErrors?.name ? true : undefined}
        />
      </Field>
      <Field
        label="תאריך התחלה"
        htmlFor="startDate"
        error={state.fieldErrors?.startDate}
      >
        <Input
          id="startDate"
          name="startDate"
          type="date"
          required
          aria-invalid={state.fieldErrors?.startDate ? true : undefined}
        />
      </Field>
      <Field
        label="תאריך סיום"
        htmlFor="endDate"
        error={state.fieldErrors?.endDate}
      >
        <Input
          id="endDate"
          name="endDate"
          type="date"
          required
          aria-invalid={state.fieldErrors?.endDate ? true : undefined}
        />
      </Field>
      <AuthSubmitButton>יצירת טיול</AuthSubmitButton>
    </form>
  );
}
