"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { buildGoogleMapsCoordinatesUrl } from "@/lib/maps/google-maps-url";
import { EMERGENCY_MESSAGES } from "./constants";
import styles from "./EmergencyPage.module.scss";

type LocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; latitude: number; longitude: number }
  | { status: "error"; message: string };

export function CurrentLocationPanel() {
  const [state, setState] = useState<LocationState>({ status: "idle" });
  const [copyMessage, setCopyMessage] = useState<string | undefined>();

  function requestLocation() {
    if (!navigator.geolocation) {
      setState({ status: "error", message: EMERGENCY_MESSAGES.locationUnsupported });
      return;
    }

    setState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "ready",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setState({ status: "error", message: EMERGENCY_MESSAGES.locationDenied });
          return;
        }
        if (error.code === error.TIMEOUT) {
          setState({ status: "error", message: EMERGENCY_MESSAGES.locationTimeout });
          return;
        }
        setState({ status: "error", message: EMERGENCY_MESSAGES.locationUnavailable });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }

  async function handleCopy(latitude: number, longitude: number) {
    try {
      await navigator.clipboard.writeText(`${latitude}, ${longitude}`);
      setCopyMessage(EMERGENCY_MESSAGES.locationCopySuccess);
    } catch {
      setCopyMessage(EMERGENCY_MESSAGES.locationCopyFailed);
    }
  }

  return (
    <div className={styles.locationPanel}>
      {state.status === "idle" || state.status === "loading" || state.status === "error" ? (
        <Button
          type="button"
          onClick={requestLocation}
          disabled={state.status === "loading"}
        >
          {state.status === "loading"
            ? "מאתר מיקום…"
            : EMERGENCY_MESSAGES.locationPrompt}
        </Button>
      ) : null}

      {state.status === "error" ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      {state.status === "ready" ? (
        <>
          <p className={styles.coords}>
            {state.latitude.toFixed(6)}, {state.longitude.toFixed(6)}
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => handleCopy(state.latitude, state.longitude)}
            >
              העתקת קואורדינטות
            </button>
            <a
              href={buildGoogleMapsCoordinatesUrl(state.latitude, state.longitude)}
              className={styles.actionButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              פתיחה במפה
            </a>
            <Button type="button" variant="ghost" size="compact" onClick={requestLocation}>
              רענון
            </Button>
          </div>
          {copyMessage ? <p className={styles.resourceMeta}>{copyMessage}</p> : null}
        </>
      ) : null}
    </div>
  );
}
