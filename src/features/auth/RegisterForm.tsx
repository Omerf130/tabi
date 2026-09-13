"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
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
  const tFields = useTranslations("Auth.fields");
  const tActions = useTranslations("Auth.actions");
  const tErrors = useTranslations("Auth.errors");
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
      {state.errorCode ? (
        <p className={styles.formError} role="alert">
          {tErrors(state.errorCode)}
        </p>
      ) : null}
      <AuthEmailField
        id="email"
        name="email"
        label={tFields("email")}
        placeholder={tFields("emailPlaceholder")}
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={
          state.fieldErrorCodes?.email
            ? tErrors(state.fieldErrorCodes.email)
            : undefined
        }
      />
      <AuthPasswordField
        id="password"
        label={tFields("password")}
        placeholder={tFields("passwordPlaceholder")}
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={256}
        error={
          state.fieldErrorCodes?.password
            ? tErrors(state.fieldErrorCodes.password)
            : undefined
        }
      />
      <div className={styles.authSubmit}>
        <AuthSubmitButton>{tActions("createAccount")}</AuthSubmitButton>
      </div>
    </form>
  );
}
