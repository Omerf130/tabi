"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { registerAction, type AuthActionState } from "./actions";
import { AuthSubmitButton } from "./AuthSubmitButton";
import styles from "./AuthForm.module.scss";

const initialState: AuthActionState = {};

type RegisterFormProps = {
  nextPath?: string | null;
};

export function RegisterForm({ nextPath }: RegisterFormProps) {
  const [state, action] = useActionState(registerAction, initialState);

  return (
    <form action={action} className={styles.form}>
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      {state.error ? (
        <p className={styles.formError} role="alert">
          {state.error}
        </p>
      ) : null}
      <div className={styles.authField}>
        <Field label="Name" htmlFor="name" error={state.fieldErrors?.name}>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            aria-invalid={state.fieldErrors?.name ? true : undefined}
          />
        </Field>
      </div>
      <div className={styles.authField}>
        <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={state.fieldErrors?.email ? true : undefined}
          />
        </Field>
      </div>
      <div className={styles.authField}>
        <Field
          label="Password"
          htmlFor="password"
          error={state.fieldErrors?.password}
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={256}
            aria-invalid={state.fieldErrors?.password ? true : undefined}
          />
        </Field>
      </div>
      <div className={styles.authSubmit}>
        <AuthSubmitButton>Create account</AuthSubmitButton>
      </div>
    </form>
  );
}
