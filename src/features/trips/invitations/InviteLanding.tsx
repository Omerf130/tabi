"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { buildAuthHref } from "@/features/auth/return-to";
import {
  acceptTripInvitationAction,
  type AcceptInviteActionState,
} from "@/features/trips/invitations/actions";
import {
  createInviteRoleLabelResolver,
  translateInvitationError,
} from "@/features/trips/invitations/translate-invitation-error";
import type { PublicInviteState } from "@/features/trips/invitations/public-invite";
import styles from "./InviteLanding.module.scss";

const initialState: AcceptInviteActionState = {};

type InviteLandingProps = {
  token: string;
  state: PublicInviteState;
  isAuthenticated: boolean;
};

export function InviteLanding({
  token,
  state,
  isAuthenticated,
}: InviteLandingProps) {
  const t = useTranslations("TripInvitations");
  const tTrips = useTranslations("Trips");
  const roleLabel = createInviteRoleLabelResolver(tTrips);

  const [actionState, action, pending] = useActionState(
    acceptTripInvitationAction,
    initialState,
  );

  const returnTo = `/invite/${token}`;
  const actionError = translateInvitationError(t, actionState.errorCode);

  if (state.status === "invalid") {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <Card>
            <h1 className={styles.title}>{t("landingTitle")}</h1>
            <p className={styles.message}>{t("errors.invalid")}</p>
          </Card>
        </div>
      </main>
    );
  }

  if (state.status === "already_member") {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <Card>
            <h1 className={styles.title}>{state.tripName}</h1>
            <p className={styles.message}>{t("errors.alreadyMember")}</p>
            <Link
              href={`/app/trips/${state.tripId}`}
              className={styles.primaryLink}
            >
              {t("enterTrip")}
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Card>
          <p className={styles.eyebrow}>{t("invitedEyebrow")}</p>
          <h1 className={styles.title}>{state.tripName}</h1>
          <p className={styles.role}>
            {t("roleLabel", { role: roleLabel(state.role) })}
          </p>

          {isAuthenticated ? (
            <form action={action} className={styles.actions}>
              <input type="hidden" name="token" value={token} />
              {actionError ? (
                <p className={styles.error} role="alert">
                  {actionError}
                </p>
              ) : null}
              <Button type="submit" loading={pending}>
                {t("joinTrip")}
              </Button>
            </form>
          ) : (
            <div className={styles.actions}>
              <Link href={buildAuthHref("/login", returnTo)} className={styles.primaryLink}>
                {t("signIn")}
              </Link>
              <Link href={buildAuthHref("/register", returnTo)} className={styles.secondaryLink}>
                {t("createAccountAndJoin")}
              </Link>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
