"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { loginAction, type AuthActionState } from "./actions";
import { AuthSubmitButton } from "./AuthSubmitButton";
import styles from "./AuthForm.module.scss";

const initialState: AuthActionState = {};

type LoginFormProps = {
  nextPath?: string | null;
  googleError?: boolean;
};

export function LoginForm({ nextPath, googleError }: LoginFormProps) {
  const [state, action] = useActionState(loginAction, initialState);

  return (
    <form action={action} className={styles.form}>
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      {googleError ? (
        <p className={styles.formError} role="alert">
          We couldn&apos;t sign you in with Google. Please try again.
        </p>
      ) : null}
      {state.error ? (
        <p className={styles.formError} role="alert">
          {state.error}
        </p>
      ) : null}
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
            autoComplete="current-password"
            required
            minLength={8}
            maxLength={256}
            aria-invalid={state.fieldErrors?.password ? true : undefined}
          />
        </Field>
      </div>
      <div className={styles.authSubmit}>
        <AuthSubmitButton>Sign in</AuthSubmitButton>
      </div>
    </form>
  );
}
