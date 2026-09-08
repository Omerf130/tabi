"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { buildAuthHref } from "@/features/auth/return-to";
import {
  acceptTripInvitationAction,
  type AcceptInviteActionState,
} from "@/features/trips/invitations/actions";
import {
  INVITE_MESSAGES,
  INVITE_ROLE_LABELS,
} from "@/features/trips/invitations/constants";
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
  const [actionState, action, pending] = useActionState(
    acceptTripInvitationAction,
    initialState,
  );

  const returnTo = `/invite/${token}`;

  if (state.status === "invalid") {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <Card>
            <h1 className={styles.title}>הזמנה לטיול</h1>
            <p className={styles.message}>{INVITE_MESSAGES.invalid}</p>
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
            <p className={styles.message}>{INVITE_MESSAGES.alreadyMember}</p>
            <Link
              href={`/app/trips/${state.tripId}`}
              className={styles.primaryLink}
            >
              כניסה לטיול
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
          <p className={styles.eyebrow}>הוזמנת להצטרף לטיול</p>
          <h1 className={styles.title}>{state.tripName}</h1>
          <p className={styles.role}>
            הרשאה: {INVITE_ROLE_LABELS[state.role]}
          </p>

          {isAuthenticated ? (
            <form action={action} className={styles.actions}>
              <input type="hidden" name="token" value={token} />
              {actionState.error ? (
                <p className={styles.error} role="alert">
                  {actionState.error}
                </p>
              ) : null}
              <Button type="submit" loading={pending}>
                הצטרפות לטיול
              </Button>
            </form>
          ) : (
            <div className={styles.actions}>
              <Link href={buildAuthHref("/login", returnTo)} className={styles.primaryLink}>
                התחברות
              </Link>
              <Link href={buildAuthHref("/register", returnTo)} className={styles.secondaryLink}>
                יצירת חשבון והצטרפות
              </Link>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
