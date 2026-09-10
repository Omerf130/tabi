"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field/Field";
import { Select } from "@/components/ui/Select/Select";
import { Button } from "@/components/ui/Button/Button";
import {
  createTripInviteAction,
  type CreateInviteActionState,
} from "@/features/trips/invitations/actions";
import { INVITE_MESSAGES, INVITE_ROLE_LABELS } from "@/features/trips/invitations/constants";
import { CopyInviteUrl } from "./CopyInviteUrl";
import styles from "./MembersPage.module.scss";

const initialState: CreateInviteActionState = {};

type CreateInviteFormProps = {
  tripId: string;
  onCancel?: () => void;
};

export function CreateInviteForm({ tripId, onCancel }: CreateInviteFormProps) {
  const [state, action, pending] = useActionState(
    createTripInviteAction,
    initialState,
  );

  return (
    <div className={styles.inviteSection}>
      <h2 className={styles.sectionTitle}>יצירת קישור הזמנה</h2>
      <form action={action} className={styles.form}>
        <input type="hidden" name="tripId" value={tripId} />
        <Field label="הרשאה" htmlFor="invite-role">
          <Select id="invite-role" name="role" defaultValue="member" required>
            <option value="member">{INVITE_ROLE_LABELS.member}</option>
            <option value="owner">{INVITE_ROLE_LABELS.owner}</option>
          </Select>
        </Field>
        <p className={styles.helper}>
          {INVITE_MESSAGES.ownerRoleWarning}
        </p>
        {state.error ? (
          <p className={styles.error} role="alert">
            {state.error}
          </p>
        ) : null}
        <div className={styles.actionsRow}>
          <Button type="submit" loading={pending}>
            יצירת קישור הזמנה
          </Button>
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel}>
              ביטול
            </Button>
          ) : null}
        </div>
      </form>
      {state.inviteUrl ? (
        <div className={styles.newInvite}>
          <p className={styles.helper}>
            העתיקו את הקישור עכשיו. לא ניתן לשחזר אותו לאחר רענון העמוד.
          </p>
          <CopyInviteUrl inviteUrl={state.inviteUrl} />
        </div>
      ) : null}
    </div>
  );
}
