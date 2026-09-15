"use client";

import { useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import type { TripDateChangeImpact } from "@/features/trips/trip-date-change/trip-date-change-types";
import styles from "./TripDateChangeConfirmDialog.module.scss";

type TripDateChangeConfirmDialogProps = {
  impact: TripDateChangeImpact;
  previewToken: string;
  tripId: string;
  onCancel: () => void;
  onConfirm: (formData: FormData) => void;
  isApplying: boolean;
  applyError?: string | null;
};

export function TripDateChangeConfirmDialog({
  impact,
  previewToken,
  tripId,
  onCancel,
  onConfirm,
  isApplying,
  applyError,
}: TripDateChangeConfirmDialogProps) {
  const t = useTranslations("TripDetailsSettings.dateChange");
  const tCommon = useTranslations("Common");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const hasDestructive =
    impact.activitiesToDelete.length > 0 ||
    impact.accommodationsToDelete.length > 0;

  const hasAdjusted = impact.accommodationsToClamp.length > 0;

  const hasKept =
    impact.transportsToReview.length > 0 ||
    impact.remindersOutOfRange.length > 0 ||
    impact.manualExpensesOutOfRange.length > 0 ||
    impact.documentsUnlinkedCount > 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) {
      return;
    }
    dialog.showModal();
    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onConfirm(new FormData(event.currentTarget));
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onCancel();
        }
      }}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <input type="hidden" name="tripId" value={tripId} />
        <input type="hidden" name="previewToken" value={previewToken} />

        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {t("confirmTitle")}
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={onCancel}
            aria-label={tCommon("cancel")}
          >
            ×
          </button>
        </header>

        <div id={descriptionId} className={styles.body}>
          <p className={styles.lead}>{t("confirmLead")}</p>

          {hasDestructive ? (
            <section className={styles.zoneDestructive} aria-labelledby="impact-destructive">
              <h3 id="impact-destructive" className={styles.zoneTitle}>
                {t("zones.destructive")}
              </h3>

              {impact.activitiesToDelete.length > 0 ? (
                <div className={styles.block}>
                  <h4 className={styles.blockTitle}>
                    {t("activitiesDeleteTitle", {
                      count: impact.activitiesToDelete.length,
                    })}
                  </h4>
                  <ul className={styles.list}>
                    {impact.activitiesToDelete.slice(0, 8).map((activity) => (
                      <li key={activity.id}>
                        {activity.title} · {activity.date}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {impact.accommodationsToDelete.length > 0 ? (
                <div className={styles.block}>
                  <h4 className={styles.blockTitle}>
                    {t("accommodationsDeleteTitle", {
                      count: impact.accommodationsToDelete.length,
                    })}
                  </h4>
                  <ul className={styles.list}>
                    {impact.accommodationsToDelete.map((item) => (
                      <li key={item.id}>
                        {item.label} · {item.checkInDate} – {item.checkOutDate}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <p className={styles.destructiveLead}>{t("destructiveLead")}</p>
            </section>
          ) : null}

          {hasAdjusted ? (
            <section className={styles.zoneAdjusted} aria-labelledby="impact-adjusted">
              <h3 id="impact-adjusted" className={styles.zoneTitle}>
                {t("zones.adjusted")}
              </h3>
              <ul className={styles.list}>
                {impact.accommodationsToClamp.map((item) => (
                  <li key={item.id}>
                    {t("accommodationClampLine", {
                      label: item.label,
                      fromCheckIn: item.fromCheckInDate,
                      fromCheckOut: item.fromCheckOutDate,
                      toCheckIn: item.toCheckInDate,
                      toCheckOut: item.toCheckOutDate,
                    })}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {hasKept ? (
            <section className={styles.zoneKept} aria-labelledby="impact-kept">
              <h3 id="impact-kept" className={styles.zoneTitle}>
                {t("zones.kept")}
              </h3>

              {impact.transportsToReview.length > 0 ? (
                <div className={styles.block}>
                  <h4 className={styles.blockTitle}>
                    {t("transportReviewTitle", {
                      count: impact.transportsToReview.length,
                    })}
                  </h4>
                  <p className={styles.info}>{t("transportKept")}</p>
                  <ul className={styles.list}>
                    {impact.transportsToReview.map((item) => (
                      <li key={item.id}>
                        {item.departureLocationName} · {item.departureDate}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {impact.remindersOutOfRange.length > 0 ? (
                <div className={styles.block}>
                  <h4 className={styles.blockTitle}>
                    {t("remindersReviewTitle", {
                      count: impact.remindersOutOfRange.length,
                    })}
                  </h4>
                  <p className={styles.info}>{t("remindersKept")}</p>
                </div>
              ) : null}

              {impact.manualExpensesOutOfRange.length > 0 ? (
                <div className={styles.block}>
                  <h4 className={styles.blockTitle}>
                    {t("manualExpensesReviewTitle", {
                      count: impact.manualExpensesOutOfRange.length,
                    })}
                  </h4>
                  <p className={styles.info}>{t("manualExpensesKept")}</p>
                </div>
              ) : null}

              {impact.documentsUnlinkedCount > 0 ? (
                <p className={styles.info}>{t("documentsPreserved")}</p>
              ) : null}
            </section>
          ) : null}

          {applyError ? (
            <p className={styles.error} role="alert">
              {applyError}
            </p>
          ) : null}
        </div>

        <footer className={styles.footer}>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isApplying}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" disabled={isApplying}>
            {hasDestructive ? t("confirmDestructive") : t("confirmApply")}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}
