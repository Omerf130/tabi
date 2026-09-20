"use client";

import { useCallback, useEffect, useState } from "react";
import {
  disablePushNotificationsOnDevice,
  enablePushNotificationsOnDevice,
  hasActiveBrowserPushSubscription,
  syncExistingBrowserSubscriptionToServer,
} from "./push-device-sync.client";
import {
  readBrowserNotificationPermission,
  resolvePushEnvironmentFromWindow,
  type BrowserNotificationPermission,
  type PushEnvironmentKind,
} from "./push-environment";

export type PushDeviceUiState =
  | "loading"
  | "unsupported"
  | "requiresInstall"
  | "permissionDenied"
  | "permissionDefault"
  | "subscribed"
  | "notSubscribed"
  | "error";

function resolveUiState(input: {
  environment: PushEnvironmentKind;
  permission: BrowserNotificationPermission;
  hasSubscription: boolean;
  errored: boolean;
}): PushDeviceUiState {
  if (input.errored) {
    return "error";
  }

  if (input.environment === "unsupported") {
    return "unsupported";
  }

  if (input.environment === "requiresInstall") {
    return "requiresInstall";
  }

  if (input.permission === "denied") {
    return "permissionDenied";
  }

  if (input.hasSubscription) {
    return "subscribed";
  }

  if (input.permission === "granted") {
    return "notSubscribed";
  }

  return "permissionDefault";
}

export function usePushNotifications() {
  const [uiState, setUiState] = useState<PushDeviceUiState>("loading");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(false);

  const refresh = useCallback(async () => {
    setActionError(false);

    if (typeof window === "undefined") {
      setUiState("loading");
      return;
    }

    try {
      const environment = resolvePushEnvironmentFromWindow(window);
      const permission = readBrowserNotificationPermission(window);
      const hasSubscription = await hasActiveBrowserPushSubscription();

      if (
        environment === "supported" &&
        permission === "granted" &&
        hasSubscription
      ) {
        await syncExistingBrowserSubscriptionToServer();
      }

      setUiState(
        resolveUiState({
          environment,
          permission,
          hasSubscription,
          errored: false,
        }),
      );
    } catch {
      setUiState("error");
    }
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) {
        return;
      }
      void refresh();
    });
    return () => {
      active = false;
    };
  }, [refresh]);

  const enable = useCallback(async () => {
    setBusy(true);
    setActionError(false);
    try {
      const result = await enablePushNotificationsOnDevice();
      if (!result.ok) {
        setActionError(true);
      }
      await refresh();
    } catch {
      setActionError(true);
      setUiState("error");
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const disable = useCallback(async () => {
    setBusy(true);
    setActionError(false);
    try {
      await disablePushNotificationsOnDevice();
      await refresh();
    } catch {
      setActionError(true);
      setUiState("error");
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  return {
    uiState,
    busy,
    actionError,
    refresh,
    enable,
    disable,
  };
}
