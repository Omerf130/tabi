"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isBeforeInstallPromptEvent,
  isIosSafariInstallCandidate,
  readStandaloneSignals,
  resolveInstallInteraction,
  runDeferredInstallPrompt,
  shouldShowPwaInstallCta,
} from "./pwa-install-environment";
import type { BeforeInstallPromptEvent } from "./pwa-install-types";

function readInitialInstallEnvironment() {
  if (typeof window === "undefined") {
    return {
      isStandalone: false,
      iosInstallEligible: false,
    };
  }

  return {
    isStandalone: readStandaloneSignals(window),
    iosInstallEligible: isIosSafariInstallCandidate(navigator.userAgent),
  };
}

export function usePwaInstall() {
  const [isStandalone, setIsStandalone] = useState(
    () => readInitialInstallEnvironment().isStandalone,
  );
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [iosInstallEligible, setIosInstallEligible] = useState(
    () => readInitialInstallEnvironment().iosInstallEligible,
  );
  const [iosInstructionsOpen, setIosInstructionsOpen] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      if (!isBeforeInstallPromptEvent(event)) {
        return;
      }

      event.preventDefault();
      setDeferredPrompt(event);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const visible = shouldShowPwaInstallCta({
    isStandalone,
    hasDeferredPrompt: deferredPrompt !== null,
    iosInstallEligible,
  });

  const handleInstallClick = useCallback(async () => {
    const interaction = resolveInstallInteraction({
      hasDeferredPrompt: deferredPrompt !== null,
      iosInstallEligible,
    });

    if (interaction === "ios-instructions") {
      setIosInstructionsOpen(true);
      return;
    }

    if (interaction === "native" && deferredPrompt) {
      setIsPrompting(true);
      try {
        await runDeferredInstallPrompt(deferredPrompt);
      } finally {
        setDeferredPrompt(null);
        setIsPrompting(false);
      }
    }
  }, [deferredPrompt, iosInstallEligible]);

  const closeIosInstructions = useCallback(() => {
    setIosInstructionsOpen(false);
  }, []);

  return {
    visible,
    handleInstallClick,
    iosInstructionsOpen,
    closeIosInstructions,
    isPrompting,
  };
}
