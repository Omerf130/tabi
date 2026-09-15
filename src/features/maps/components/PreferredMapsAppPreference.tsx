"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  updateUserPreferredMapsAppAction,
  type UpdateUserPreferredMapsAppState,
} from "@/features/maps/actions/update-user-preferred-maps-app";
import {
  MAPS_APPS,
  resolvePreferredMapsApp,
  type MapsApp,
} from "@/lib/maps/maps-app";
import styles from "./PreferredMapsAppPreference.module.scss";

type PreferredMapsAppPreferenceProps = {
  storedPreferredMapsApp: MapsApp | null;
  variant?: "default" | "settingsList";
};

const INITIAL_STATE: UpdateUserPreferredMapsAppState = {};

export function PreferredMapsAppPreference({
  storedPreferredMapsApp,
  variant = "default",
}: PreferredMapsAppPreferenceProps) {
  const t = useTranslations("Settings");
  const tErrors = useTranslations("Errors");
  const [state, formAction, pending] = useActionState(
    updateUserPreferredMapsAppAction,
    INITIAL_STATE,
  );

  const effectiveProvider = resolvePreferredMapsApp(storedPreferredMapsApp);

  const rootClass =
    variant === "settingsList" ? `${styles.root} ${styles.rootSettingsList}` : styles.root;
  const optionsClass =
    variant === "settingsList"
      ? `${styles.options} ${styles.optionsSettingsList}`
      : styles.options;
  const optionClass =
    variant === "settingsList" ? `${styles.option} ${styles.optionSettingsList}` : styles.option;

  const optionLabels: Record<MapsApp, string> = {
    google: t("mapsPage.providers.google"),
    waze: t("mapsPage.providers.waze"),
    apple: t("mapsPage.providers.apple"),
  };

  return (
    <div className={rootClass}>
      <form action={formAction} className={optionsClass}>
        {MAPS_APPS.map((provider) => (
          <button
            key={provider}
            type="submit"
            name="preferredMapsApp"
            value={provider}
            className={optionClass}
            data-active={effectiveProvider === provider ? "true" : undefined}
            aria-pressed={effectiveProvider === provider}
            disabled={pending}
          >
            {optionLabels[provider]}
          </button>
        ))}
      </form>
      {state.errorCode === "invalid_preferred_maps_app" ? (
        <p className={styles.error} role="alert">
          {tErrors("invalidPreferredMapsApp")}
        </p>
      ) : null}
    </div>
  );
}
