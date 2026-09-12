"use client";

import { useActionState } from "react";
import { loginAction, type AuthActionState } from "./actions";
import { AuthEmailField, AuthPasswordField } from "./AuthField";
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
      <AuthEmailField
        id="email"
        name="email"
        label="Email"
        placeholder="Email Address"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <AuthPasswordField
        id="password"
        label="Password"
        placeholder="Password"
        autoComplete="current-password"
        required
        minLength={8}
        maxLength={256}
        error={state.fieldErrors?.password}
      />
      <div className={styles.authSubmit}>
        <AuthSubmitButton>Log In</AuthSubmitButton>
      </div>
    </form>
  );
}
