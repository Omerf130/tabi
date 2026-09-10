"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { AppPage } from "@/features/app-shell/AppPage";
import { formatCalendarDateDisplay } from "@/features/trips/calendar-date";
import { deleteTransportAction, type TransportActionState } from "./actions";
import {
  buildTransportEditHref,
  buildTransportHref,
  TRANSPORT_MESSAGES,
} from "./constants";
import {
  TRAIN_CATEGORY_LABELS,
  type TrainCategory,
} from "./transport-types";
import type { TransportDetailViewModel } from "./types";
import styles from "./TransportDetail.module.scss";

const initialState: TransportActionState = {};

type TransportDetailContentProps = {
  tripId: string;
  transport: TransportDetailViewModel;
  isOwner: boolean;
};

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) {
    return null;
  }

  return (
    <div className={styles.detailItem}>
      <dt>{label}</dt>
      <dd dir="auto">{value}</dd>
    </div>
  );
}

function FlightDetails({ transport }: { transport: TransportDetailViewModel }) {
  const details = transport.details;
  if (transport.type !== "flight") {
    return null;
  }

  return (
    <>
      <DetailRow label="חברת תעופה" value={details.airline} />
      <DetailRow label="מספר טיסה" value={details.flightNumber} />
      <DetailRow label="טרמינל יציאה" value={details.departureTerminal} />
      <DetailRow label="טרמינל הגעה" value={details.arrivalTerminal} />
      <DetailRow label="שער" value={details.gate} />
      <DetailRow label="מושב" value={details.seat} />
    </>
  );
}

function TrainDetails({ transport }: { transport: TransportDetailViewModel }) {
  const details = transport.details;
  if (transport.type !== "train") {
    return null;
  }

  const categoryLabel = details.trainCategory
    ? TRAIN_CATEGORY_LABELS[details.trainCategory as TrainCategory]
    : undefined;

  return (
    <>
      <DetailRow label="סוג רכבת" value={categoryLabel} />
      <DetailRow label="שם שירות" value={details.serviceName} />
      <DetailRow label="מספר רכבת" value={details.trainNumber} />
      <DetailRow label="קרון" value={details.carNumber} />
      <DetailRow label="מושבים" value={details.seats} />
    </>
  );
}

function OperatorDetails({ transport }: { transport: TransportDetailViewModel }) {
  const details = transport.details;
  if (transport.type === "flight" || transport.type === "train") {
    return null;
  }

  return (
    <>
      <DetailRow label="מפעיל / חברה" value={details.operator} />
      <DetailRow label="מספר שירות / רכב" value={details.serviceNumber} />
      <DetailRow label="פרטי רכב / שירות" value={details.vehicleOrServiceNotes} />
    </>
  );
}

export function TransportDetailContent({
  tripId,
  transport,
  isOwner,
}: TransportDetailContentProps) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [state, formAction] = useActionState(deleteTransportAction, initialState);

  useEffect(() => {
    if (state.ok) {
      router.push(buildTransportHref(tripId));
    }
  }, [router, state.ok, tripId]);

  return (
    <AppPage width="content">
      <Card variant="standard">
        <dl className={styles.detailsList}>
          <div className={styles.detailItem}>
            <dt>סוג</dt>
            <dd>{transport.typeLabel}</dd>
          </div>
          <div className={styles.detailItem}>
            <dt>מסלול</dt>
            <dd dir="auto">{transport.routeLabel}</dd>
          </div>
          {transport.metaLabel ? (
            <div className={styles.detailItem}>
              <dt>פרטים</dt>
              <dd dir="auto">{transport.metaLabel}</dd>
            </div>
          ) : null}
          <div className={styles.detailItem}>
            <dt>יציאה</dt>
            <dd>
              {formatCalendarDateDisplay(transport.departure.date)} ·{" "}
              {transport.departureTimeLabel} ({transport.departureTimezoneLabel})
            </dd>
          </div>
          <div className={styles.detailItem}>
            <dt>הגעה</dt>
            <dd>
              {formatCalendarDateDisplay(transport.arrival.date)} ·{" "}
              {transport.arrivalTimeLabel} ({transport.arrivalTimezoneLabel})
            </dd>
          </div>
          {transport.linkedCost ? (
            <div className={styles.detailItem}>
              <dt>עלות</dt>
              <dd>{transport.linkedCost.label}</dd>
            </div>
          ) : null}
          <DetailRow label="מספר הזמנה" value={transport.bookingReference} />
          <DetailRow label="הערות" value={transport.notes} />
          <FlightDetails transport={transport} />
          <TrainDetails transport={transport} />
          <OperatorDetails transport={transport} />
        </dl>
      </Card>

      {transport.linkedDocuments.length > 0 ? (
        <section className={styles.documentsSection}>
          <h2 className={styles.documentsTitle}>מסמכים מקושרים</h2>
          <ul className={styles.documentsList}>
            {transport.linkedDocuments.map((document) => (
              <li key={document.id}>
                <Link href={document.href} className={styles.documentLink}>
                  {document.title}
                  <span className={styles.documentCategory}>{document.categoryLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {isOwner ? (
        <div className={styles.actions}>
          <Link
            href={buildTransportEditHref(tripId, transport.id)}
            className={styles.actionLinkPrimary}
          >
            עריכה
          </Link>
          {!confirmDelete ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmDelete(true)}
            >
              מחיקה
            </Button>
          ) : (
            <form action={formAction} className={styles.deleteForm}>
              <input type="hidden" name="tripId" value={tripId} />
              <input type="hidden" name="transportId" value={transport.id} />
              {state.error ? (
                <p className={styles.formError} role="alert">
                  {state.error}
                </p>
              ) : null}
              <p className={styles.deleteConfirm}>{TRANSPORT_MESSAGES.deleteConfirm}</p>
              <div className={styles.deleteActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setConfirmDelete(false)}
                >
                  ביטול
                </Button>
                <Button type="submit" variant="danger">
                  מחיקה
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </AppPage>
  );
}
