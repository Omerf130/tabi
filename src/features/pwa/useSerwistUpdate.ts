"use client";

import { useSerwist } from "@serwist/turbopack/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { applySwUpdate } from "./sw-update-apply-flow";
import { isWaitingWorkerUpdate } from "./sw-update-state";

const SW_SCOPE = "/";

async function getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!("serviceWorker" in navigator)) {
    return undefined;
  }

  return navigator.serviceWorker.getRegistration(SW_SCOPE);
}

async function syncWaitingState(
  setHasWaitingWorker: (value: boolean) => void,
  setIsFirstInstallWaiting: (value: boolean) => void,
) {
  const registration = await getRegistration();
  const waiting = registration?.waiting ?? null;
  const hasController = Boolean(navigator.serviceWorker.controller);

  if (!waiting) {
    setHasWaitingWorker(false);
    setIsFirstInstallWaiting(false);
    return;
  }

  setHasWaitingWorker(true);
  setIsFirstInstallWaiting(!isWaitingWorkerUpdate(hasController));
}

export function useSerwistUpdate() {
  const { serwist } = useSerwist();
  const [hasWaitingWorker, setHasWaitingWorker] = useState(false);
  const [isFirstInstallWaiting, setIsFirstInstallWaiting] = useState(false);
  const [dismissedForSession, setDismissedForSession] = useState(false);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);
  const isApplyingUpdateRef = useRef(false);

  useEffect(() => {
    if (!serwist) {
      return;
    }

    const onWaiting = (event: { isUpdate?: boolean }) => {
      setDismissedForSession(false);
      const hasController = Boolean(navigator.serviceWorker.controller);
      const isUpdate = event.isUpdate ?? hasController;
      setHasWaitingWorker(true);
      setIsFirstInstallWaiting(!isUpdate && !hasController);
    };

    const onRedundant = () => {
      void syncWaitingState(setHasWaitingWorker, setIsFirstInstallWaiting);
    };

    serwist.addEventListener("waiting", onWaiting);
    serwist.addEventListener("redundant", onRedundant);

    void syncWaitingState(setHasWaitingWorker, setIsFirstInstallWaiting);

    return () => {
      serwist.removeEventListener("waiting", onWaiting);
      serwist.removeEventListener("redundant", onRedundant);
    };
  }, [serwist]);

  useEffect(() => {
    if (!serwist) {
      return;
    }

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      setDismissedForSession(false);
      void serwist.update().then(() => {
        void syncWaitingState(setHasWaitingWorker, setIsFirstInstallWaiting);
      });
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [serwist]);

  const dismissForNow = useCallback(() => {
    setDismissedForSession(true);
  }, []);

  const applyUpdate = useCallback(async () => {
    if (!serwist) {
      return;
    }

    setIsApplyingUpdate(true);
    const started = await applySwUpdate({
      serwist,
      isApplyingUpdateRef,
    });

    if (!started) {
      setIsApplyingUpdate(false);
      isApplyingUpdateRef.current = false;
    }
  }, [serwist]);

  return {
    hasWaitingWorker,
    isFirstInstallWaiting,
    dismissedForSession,
    isApplyingUpdate,
    dismissForNow,
    applyUpdate,
  };
}
