"use client";

import { useActionState, useState } from "react";
import { registerAction, type AuthActionState } from "./actions";
import { deriveRegistrationNameFromEmail } from "./derive-registration-name";
import { AuthEmailField, AuthPasswordField } from "./AuthField";
import { AuthSubmitButton } from "./AuthSubmitButton";
import styles from "./AuthForm.module.scss";

const initialState: AuthActionState = {};

type RegisterFormProps = {
  nextPath?: string | null;
};

export function RegisterForm({ nextPath }: RegisterFormProps) {
  const [state, action] = useActionState(registerAction, initialState);
  const [email, setEmail] = useState("");

  return (
    <form action={action} className={styles.form}>
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      <input
        type="hidden"
        name="name"
        value={deriveRegistrationNameFromEmail(email)}
      />
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
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={state.fieldErrors?.email}
      />
      <AuthPasswordField
        id="password"
        label="Password"
        placeholder="Password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={256}
        error={state.fieldErrors?.password}
      />
      <div className={styles.authSubmit}>
        <AuthSubmitButton>Create Account</AuthSubmitButton>
      </div>
    </form>
  );
}
