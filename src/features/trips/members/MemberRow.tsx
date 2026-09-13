"use client";

import { useActionState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { Select } from "@/components/ui/Select/Select";
import { localeToIntlLocale, resolveAppLocale } from "@/features/i18n/locale";
import { createTripRoleLabelResolver } from "@/features/trips/trip-labels";
import {
  changeTripMemberRoleAction,
  removeTripMemberAction,
  type MemberActionState,
} from "./actions";
import type { TripMemberListItem } from "./owner-invariant";
import {
  translateMemberError,
  translateMemberSuccess,
} from "./translate-member-error";
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
  const tMembers = useTranslations("TripMembers");
  const tTrips = useTranslations("Trips");
  const intlLocale = localeToIntlLocale(resolveAppLocale(useLocale()));
  const roleLabel = createTripRoleLabelResolver(tTrips);

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
      ? tMembers("leaveTripConfirm")
      : tMembers("removeMemberConfirm", { name: member.name });
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
      if (!window.confirm(tMembers("removeOwnerConfirm"))) {
        return;
      }
    }
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("membershipId", member.membershipId);
    formData.set("role", nextRole);
    changeAction(formData);
  }

  const error =
    translateMemberError(tMembers, state.errorCode ?? removeState.errorCode);
  const success = translateMemberSuccess(
    tMembers,
    state.successCode ?? removeState.successCode,
  );

  return (
    <article className={styles.memberCard}>
      <div className={styles.memberHeader}>
        <p className={styles.memberName}>{member.name}</p>
        <p className={styles.memberEmail}>{member.email}</p>
        <p className={styles.meta}>
          {roleLabel(member.role)} ·{" "}
          {new Date(member.joinedAt).toLocaleDateString(intlLocale)}
        </p>
      </div>

      {isOwnerView ? (
        <div className={styles.memberActions}>
          <Select
            value={member.role}
            aria-label={tMembers("roleAria", { name: member.name })}
            onChange={(event) =>
              handleRoleChange(event.target.value as "owner" | "member")
            }
          >
            <option value="owner">{roleLabel("owner")}</option>
            <option value="member">{roleLabel("member")}</option>
          </Select>
          <Button type="button" variant="danger" onClick={handleRemove}>
            {member.userId === currentUserId
              ? tMembers("leaveTrip")
              : tMembers("removeMember")}
          </Button>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          {success ? <p className={styles.success}>{success}</p> : null}
        </div>
      ) : null}
    </article>
  );
}
