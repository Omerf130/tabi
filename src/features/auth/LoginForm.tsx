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
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, action] = useActionState(loginAction, initialState);

  return (
    <form action={action} className={styles.form}>
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      {state.error ? (
        <p className={styles.formError} role="alert">
          {state.error}
        </p>
      ) : null}
      <Field label="אימייל" htmlFor="email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={state.fieldErrors?.email ? true : undefined}
        />
      </Field>
      <Field
        label="סיסמה"
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
      <AuthSubmitButton>כניסה</AuthSubmitButton>
    </form>
  );
}
