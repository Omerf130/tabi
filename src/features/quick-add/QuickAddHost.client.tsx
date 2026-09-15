"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconBack } from "@/components/ui/icons";
import { confirmDayActionDiscard } from "@/features/itinerary/confirm-day-action-discard";
import { TransportTypeChooser } from "@/features/itinerary/TransportTypeChooser.client";
import type { TransportType } from "@/features/transport/transport-types";
import { QuickAddForms } from "./QuickAddForms.client";
import { QuickAddMenu } from "./QuickAddMenu.client";
import {
  canQuickAddGoBack,
  getQuickAddBackTarget,
  quickAddActionToStep,
} from "./quick-add-navigation";
import { getQuickAddStepTitle } from "./quick-add-menu";
import { useQuickAdd } from "./QuickAddProvider.client";
import type { QuickAddAction } from "./types";
import styles from "./QuickAdd.module.scss";

export function QuickAddHost() {
  const t = useTranslations("QuickAdd");
  const tItinerary = useTranslations("Itinerary");
  const tActivity = useTranslations("Activity");
  const router = useRouter();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [dirty, setDirty] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const {
    isOpen,
    step,
    context,
    bootstrap,
    close,
    setStep,
    lastOpenerRef,
  } = useQuickAdd();

  const requestClose = useCallback(() => {
    if (!confirmDayActionDiscard(dirty, tActivity)) {
      return;
    }
    setDirty(false);
    close();
    lastOpenerRef.current?.focus();
  }, [close, dirty, lastOpenerRef, tActivity]);

  const requestBack = useCallback(() => {
    if (!confirmDayActionDiscard(dirty, tActivity)) {
      return;
    }
    setDirty(false);
    const target = getQuickAddBackTarget(step);
    if (target) {
      setStep(target);
    }
  }, [dirty, setStep, step, tActivity]);

  const handleMutationSuccess = useCallback(() => {
    setDirty(false);
    close();
    router.refresh();
    lastOpenerRef.current?.focus();
  }, [close, lastOpenerRef, router]);

  const handleMenuSelect = useCallback(
    (action: QuickAddAction) => {
      setDirty(false);
      setStep(quickAddActionToStep(action));
    },
    [setStep],
  );

  const handleTransportTypeSelect = useCallback(
    (transportType: TransportType) => {
      setDirty(false);
      setStep({ kind: "form", action: "transport", transportType });
    },
    [setStep],
  );

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (isDesktop) {
      const dialog = dialogRef.current;
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    } else {
      panelRef.current?.focus();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        requestClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (isDesktop && dialogRef.current?.open) {
        dialogRef.current.close();
      }
    };
  }, [isOpen, isDesktop, requestClose]);

  if (!isOpen) {
    return null;
  }

  const showBack = canQuickAddGoBack(step);
  const title = getQuickAddStepTitle(step, t, tItinerary);
  const isFormStep = step.kind === "form";

  const surfaceBody = (
    <>
      <div className={styles.hostHeader}>
        {showBack ? (
          <button
            type="button"
            className={styles.hostBack}
            aria-label={t("backAria")}
            onClick={requestBack}
          >
            <IconBack className={styles.hostBackIcon} aria-hidden />
          </button>
        ) : (
          <span className={styles.hostBackSpacer} aria-hidden />
        )}
        <div className={styles.hostTitles}>
          <h2 id={titleId} className={styles.hostTitle}>
            {title}
          </h2>
        </div>
        <button
          type="button"
          className={styles.hostClose}
          aria-label={t("closeAria")}
          onClick={requestClose}
        >
          ✕
        </button>
      </div>

      <div
        className={
          isFormStep ? `${styles.hostBody} ${styles.hostBodyForm}` : styles.hostBody
        }
      >
        {step.kind === "menu" ? (
          <QuickAddMenu role={bootstrap.role} onSelect={handleMenuSelect} />
        ) : null}
        {step.kind === "transport-type" ? (
          <TransportTypeChooser onSelect={handleTransportTypeSelect} />
        ) : null}
        <QuickAddForms
          step={step}
          context={context}
          bootstrap={bootstrap}
          onSuccess={handleMutationSuccess}
          onDirtyChange={setDirty}
          onTransportTypeChange={(transportType) => {
            setStep({ kind: "form", action: "transport", transportType });
          }}
        />
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <dialog
        ref={dialogRef}
        className={styles.desktopDialog}
        aria-labelledby={titleId}
        onCancel={(event) => {
          event.preventDefault();
          requestClose();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            requestClose();
          }
        }}
      >
        <div className={styles.desktopPanel}>{surfaceBody}</div>
      </dialog>
    );
  }

  return (
    <div className={styles.mobileSheetRoot}>
      <button
        type="button"
        className={styles.mobileSheetBackdrop}
        aria-label={t("closeAria")}
        onClick={requestClose}
      />
      <div
        ref={panelRef}
        className={
          step.kind === "menu" || isFormStep
            ? `${styles.mobileSheetPanel} ${styles.mobileSheetPanelForm}`
            : styles.mobileSheetPanel
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={styles.sheetHandle} aria-hidden />
        {surfaceBody}
      </div>
    </div>
  );
}
