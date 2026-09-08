"use client";

import { useActionState, useTransition } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Select } from "@/components/ui/Select/Select";
import {
  changeTripMemberRoleAction,
  removeTripMemberAction,
  type MemberActionState,
} from "./actions";
import { TRIP_ROLE_LABELS } from "@/features/trips/constants";
import type { TripMemberListItem } from "./owner-invariant";
import styles from "./MembersPage.module.scss";

const initialState: MemberActionState = {};

type MemberRowProps = {
  tripId: string;
  member: TripMemberListItem;
  isOwnerView: boolean;
  currentUserId: string;
};

export function MemberRow({
  tripId,
  member,
  isOwnerView,
  currentUserId,
}: MemberRowProps) {
  const [state, changeAction] = useActionState(
    changeTripMemberRoleAction,
    initialState,
  );
  const [, startTransition] = useTransition();
  const [removeState, removeAction] = useActionState(
    removeTripMemberAction,
    initialState,
  );

  function handleRemove() {
    const isSelf = member.userId === currentUserId;
    const message = isSelf
      ? "לעזוב את הטיול?"
      : `להסיר את ${member.name} מהטיול?`;
    if (!window.confirm(message)) {
      return;
    }
    startTransition(() => {
      const formData = new FormData();
      formData.set("tripId", tripId);
      formData.set("membershipId", member.membershipId);
      removeAction(formData);
    });
  }

  function handleRoleChange(nextRole: "owner" | "member") {
    if (member.role === "owner" && nextRole === "member") {
      if (
        !window.confirm(
          "להסיר הרשאות ניהול? בעלים לא יוכל לנהל חברים והזמנות.",
        )
      ) {
        return;
      }
    }
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("membershipId", member.membershipId);
    formData.set("role", nextRole);
    changeAction(formData);
  }

  return (
    <article className={styles.memberCard}>
      <div className={styles.memberHeader}>
        <p className={styles.memberName}>{member.name}</p>
        <p className={styles.memberEmail}>{member.email}</p>
        <p className={styles.meta}>
          {TRIP_ROLE_LABELS[member.role]} ·{" "}
          {new Date(member.joinedAt).toLocaleDateString("he-IL")}
        </p>
      </div>

      {isOwnerView ? (
        <div className={styles.memberActions}>
          <Select
            value={member.role}
            aria-label={`תפקיד של ${member.name}`}
            onChange={(event) =>
              handleRoleChange(event.target.value as "owner" | "member")
            }
          >
            <option value="owner">{TRIP_ROLE_LABELS.owner}</option>
            <option value="member">{TRIP_ROLE_LABELS.member}</option>
          </Select>
          <Button type="button" variant="danger" onClick={handleRemove}>
            {member.userId === currentUserId ? "עזיבת הטיול" : "הסרה"}
          </Button>
          {state.error || removeState.error ? (
            <p className={styles.error} role="alert">
              {state.error ?? removeState.error}
            </p>
          ) : null}
          {state.success || removeState.success ? (
            <p className={styles.success}>{state.success ?? removeState.success}</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
