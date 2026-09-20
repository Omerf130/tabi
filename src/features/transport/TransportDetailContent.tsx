"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { AppPage } from "@/features/app-shell/AppPage";
import { formatCalendarDateDisplay } from "@/features/trips/calendar-date";
import { deleteTransportAction, type TransportActionState } from "./actions";
import {
  buildTransportEditHref,
  buildTransportHref,
} from "./constants";
import { createTrainCategoryLabelResolver } from "./transport-labels";
import type { TrainCategory } from "./transport-types";
import type { TransportDetailViewModel } from "./types";
import styles from "./TransportDetail.module.scss";

const initialState: TransportActionState = {};

type TransportDetailContentProps = {
  tripId: string;
  transport: TransportDetailViewModel;
  isOwner: boolean;
  destinationCountryCode?: string | null;
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

function FlightDetails({
  transport,
  t,
}: {
  transport: TransportDetailViewModel;
  t: ReturnType<typeof useTranslations<"Transport">>;
}) {
  const details = transport.details;
  if (transport.type !== "flight") {
    return null;
  }

  return (
    <>
      <DetailRow label={t("airline")} value={details.airline} />
      <DetailRow label={t("flightNumber")} value={details.flightNumber} />
      <DetailRow label={t("departureTerminal")} value={details.departureTerminal} />
      <DetailRow label={t("arrivalTerminal")} value={details.arrivalTerminal} />
      <DetailRow label={t("gate")} value={details.gate} />
      <DetailRow label={t("seat")} value={details.seat} />
    </>
  );
}

function TrainDetails({
  transport,
  t,
  trainCategoryLabel,
}: {
  transport: TransportDetailViewModel;
  t: ReturnType<typeof useTranslations<"Transport">>;
  trainCategoryLabel: ReturnType<typeof createTrainCategoryLabelResolver>;
}) {
  const details = transport.details;
  if (transport.type !== "train") {
    return null;
  }

  const categoryLabel = details.trainCategory
    ? trainCategoryLabel(details.trainCategory as TrainCategory)
    : undefined;

  return (
    <>
      <DetailRow label={t("trainType")} value={categoryLabel} />
      <DetailRow label={t("serviceName")} value={details.serviceName} />
      <DetailRow label={t("trainNumber")} value={details.trainNumber} />
      <DetailRow label={t("carNumber")} value={details.carNumber} />
      <DetailRow label={t("seats")} value={details.seats} />
    </>
  );
}

function OperatorDetails({
  transport,
  t,
}: {
  transport: TransportDetailViewModel;
  t: ReturnType<typeof useTranslations<"Transport">>;
}) {
  const details = transport.details;
  if (transport.type === "flight" || transport.type === "train") {
    return null;
  }

  return (
    <>
      <DetailRow label={t("operator")} value={details.operator} />
      <DetailRow label={t("serviceNumber")} value={details.serviceNumber} />
      <DetailRow label={t("vehicleNotes")} value={details.vehicleOrServiceNotes} />
    </>
  );
}

export function TransportDetailContent({
  tripId,
  transport,
  isOwner,
  destinationCountryCode,
}: TransportDetailContentProps) {
  const t = useTranslations("Transport");
  const tCommon = useTranslations("Common");
  const tErrors = useTranslations("Transport.errors");
  const trainCategoryLabel = createTrainCategoryLabelResolver(t, destinationCountryCode);
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
            <dt>{t("type")}</dt>
            <dd>{transport.typeLabel}</dd>
          </div>
          <div className={styles.detailItem}>
            <dt>{t("route")}</dt>
            <dd dir="auto">{transport.routeLabel}</dd>
          </div>
          {transport.metaLabel ? (
            <div className={styles.detailItem}>
              <dt>{t("details")}</dt>
              <dd dir="auto">{transport.metaLabel}</dd>
            </div>
          ) : null}
          <div className={styles.detailItem}>
            <dt>{t("departure")}</dt>
            <dd>
              {formatCalendarDateDisplay(transport.departure.date)} ·{" "}
              {transport.departureTimeLabel} ({transport.departureTimezoneLabel})
            </dd>
          </div>
          <div className={styles.detailItem}>
            <dt>{t("arrival")}</dt>
            <dd>
              {formatCalendarDateDisplay(transport.arrival.date)} ·{" "}
              {transport.arrivalTimeLabel} ({transport.arrivalTimezoneLabel})
            </dd>
          </div>
          {transport.linkedCost ? (
            <div className={styles.detailItem}>
              <dt>{t("cost")}</dt>
              <dd>{transport.linkedCost.label}</dd>
            </div>
          ) : null}
          <DetailRow label={t("bookingReference")} value={transport.bookingReference} />
          <DetailRow label={tCommon("notes")} value={transport.notes} />
          <FlightDetails transport={transport} t={t} />
          <TrainDetails
            transport={transport}
            t={t}
            trainCategoryLabel={trainCategoryLabel}
          />
          <OperatorDetails transport={transport} t={t} />
        </dl>
      </Card>

      {transport.linkedDocuments.length > 0 ? (
        <section className={styles.documentsSection}>
          <h2 className={styles.documentsTitle}>{t("linkedDocuments")}</h2>
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
            {tCommon("edit")}
          </Link>
          {!confirmDelete ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmDelete(true)}
            >
              {tCommon("delete")}
            </Button>
          ) : (
            <form action={formAction} className={styles.deleteForm}>
              <input type="hidden" name="tripId" value={tripId} />
              <input type="hidden" name="transportId" value={transport.id} />
              {state.errorCode ? (
                <p className={styles.formError} role="alert">
                  {tErrors(state.errorCode)}
                </p>
              ) : null}
              <p className={styles.deleteConfirm}>{tErrors("deleteConfirm")}</p>
              <div className={styles.deleteActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setConfirmDelete(false)}
                >
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" variant="danger">
                  {tCommon("delete")}
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </AppPage>
  );
}
