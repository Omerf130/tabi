"use client";

import { useState, type InputHTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { IconEye, IconEyeOff, IconLock, IconMail } from "@/components/ui/icons";
import styles from "./AuthField.module.scss";

type AuthFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "name" | "type" | "autoComplete" | "required" | "minLength" | "maxLength" | "value" | "onChange"
>;

export function AuthEmailField({
  id,
  label,
  placeholder,
  error,
  ...inputProps
}: AuthFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.srOnly} htmlFor={id}>
        {label}
      </label>
      <div className={styles.controlWrap}>
        <IconMail className={styles.leadingIcon} aria-hidden />
        <input
          {...inputProps}
          id={id}
          type="email"
          placeholder={placeholder}
          className={styles.control}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error ? (
        <p className={styles.fieldError} id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AuthPasswordField({
  id,
  label,
  placeholder,
  error,
  autoComplete,
  required,
  minLength,
  maxLength,
  name = "password",
}: Omit<AuthFieldProps, "type" | "value" | "onChange">) {
  const t = useTranslations("Auth.fields");
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.field}>
      <label className={styles.srOnly} htmlFor={id}>
        {label}
      </label>
      <div className={styles.controlWrap}>
        <IconLock className={styles.leadingIcon} aria-hidden />
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          className={`${styles.control} ${styles.passwordControl}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? t("hidePassword") : t("showPassword")}
          aria-pressed={visible}
        >
          {visible ? (
            <IconEyeOff className={styles.toggleIcon} aria-hidden />
          ) : (
            <IconEye className={styles.toggleIcon} aria-hidden />
          )}
        </button>
      </div>
      {error ? (
        <p className={styles.fieldError} id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
