"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
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
  const tFields = useTranslations("Auth.fields");
  const tActions = useTranslations("Auth.actions");
  const tErrors = useTranslations("Auth.errors");
  const [state, action] = useActionState(loginAction, initialState);

  return (
    <form action={action} className={styles.form}>
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      {googleError ? (
        <p className={styles.formError} role="alert">
          {tErrors("googleSignInFailed")}
        </p>
      ) : null}
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
        autoComplete="current-password"
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
        <AuthSubmitButton>{tActions("logIn")}</AuthSubmitButton>
      </div>
    </form>
  );
}
