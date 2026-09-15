"use client";



import { useActionState, useEffect, useState, useTransition } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { useLocale, useTranslations } from "next-intl";

import { Input } from "@/components/ui/Input/Input";

import { IconBack, IconMore } from "@/components/ui/icons";

import { localeToIntlLocale, resolveAppLocale } from "@/features/i18n/locale";

import { buildSettingsHubHref } from "@/features/settings/constants";

import {

  createTripInviteAction,

  revokeTripInvitationAction,

  type CreateInviteActionState,

  type RevokeInviteActionState,

} from "@/features/trips/invitations/actions";

import { translateInvitationError } from "@/features/trips/invitations/translate-invitation-error";

import {

  changeTripMemberRoleAction,

  leaveTripAction,

  removeTripMemberAction,

  type MemberActionState,

} from "@/features/trips/members/actions";

import {

  translateMemberError,

  translateMemberSuccess,

} from "@/features/trips/members/translate-member-error";

import { createTripRoleLabelResolver } from "@/features/trips/trip-labels";

import type { InvitationListItem } from "@/features/trips/invitations/public-invite";

import { TravelersConfirmDialog } from "./TravelersConfirmDialog.client";

import { TravelersSettingsSheet } from "./TravelersSettingsSheet.client";

import { travelerInitials } from "./traveler-initials";

import type {

  TravelerSettingsRow,

  TravelersSettingsViewModel,

} from "./build-travelers-settings-view-model";

import styles from "./TravelersSettings.module.scss";



const memberActionInitial: MemberActionState = {};

const inviteInitial: CreateInviteActionState = {};

const revokeInitial: RevokeInviteActionState = {};



type ConfirmState =

  | { kind: "remove"; traveler: TravelerSettingsRow }

  | { kind: "leave" }

  | { kind: "demote"; traveler: TravelerSettingsRow }

  | { kind: "revoke"; invitation: InvitationListItem };



export function TravelersSettingsClient({

  model,

}: {

  model: TravelersSettingsViewModel;

}) {

  const t = useTranslations("TravelersSettings");

  const tTrips = useTranslations("Trips");

  const tInvitations = useTranslations("TripInvitations");

  const tMembers = useTranslations("TripMembers");

  const router = useRouter();

  const intlLocale = localeToIntlLocale(resolveAppLocale(useLocale()));

  const roleLabel = createTripRoleLabelResolver(tTrips);



  const [manageTraveler, setManageTraveler] = useState<TravelerSettingsRow | null>(

    null,

  );

  const [inviteOpen, setInviteOpen] = useState(false);

  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const [pending, startTransition] = useTransition();



  const [memberState, memberDispatch] = useActionState(

    changeTripMemberRoleAction,

    memberActionInitial,

  );

  const [removeState, removeDispatch] = useActionState(

    removeTripMemberAction,

    memberActionInitial,

  );

  const [leaveState, leaveDispatch] = useActionState(

    leaveTripAction,

    memberActionInitial,

  );

  const [inviteState, inviteAction, invitePending] = useActionState(

    createTripInviteAction,

    inviteInitial,

  );

  const [revokeState, revokeAction, revokePending] = useActionState(

    revokeTripInvitationAction,

    revokeInitial,

  );



  const ownerCount = model.isOwner ? model.ownerCount : 0;

  const canLeaveAsOwner = model.isOwner && ownerCount > 1;

  const canLeaveAsMember = !model.isOwner;

  const showLeaveTrip = canLeaveAsOwner || canLeaveAsMember;

  const soleOwner = model.isOwner && ownerCount <= 1;



  const actionError = translateMemberError(

    tMembers,

    memberState.errorCode ??

      removeState.errorCode ??

      leaveState.errorCode,

  );

  const actionSuccess = translateMemberSuccess(

    tMembers,

    memberState.successCode ?? removeState.successCode,

  );

  const inviteError = translateInvitationError(tInvitations, inviteState.errorCode);

  const revokeError = translateInvitationError(tInvitations, revokeState.errorCode);



  useEffect(() => {

    if (memberState.successCode || removeState.successCode) {

      router.refresh();

    }

  }, [memberState.successCode, removeState.successCode, router]);



  function runRoleChange(traveler: TravelerSettingsRow, role: "owner" | "member") {

    setConfirm(null);

    setManageTraveler(null);

    startTransition(() => {

      const formData = new FormData();

      formData.set("tripId", model.tripId);

      formData.set("membershipId", traveler.membershipId);

      formData.set("role", role);

      memberDispatch(formData);

    });

  }



  function runRemove(traveler: TravelerSettingsRow) {

    setConfirm(null);

    startTransition(() => {

      const formData = new FormData();

      formData.set("tripId", model.tripId);

      formData.set("membershipId", traveler.membershipId);

      removeDispatch(formData);

    });

  }



  function runLeave() {

    startTransition(() => {

      const formData = new FormData();

      formData.set("tripId", model.tripId);

      leaveDispatch(formData);

    });

  }



  function subtitleForTraveler(traveler: TravelerSettingsRow) {

    const role = roleLabel(traveler.role);

    if (traveler.isCurrentUser) {

      return t("youRole", { role });

    }

    return role;

  }



  function travelerHasManageMenu(traveler: TravelerSettingsRow): boolean {

    if (!model.isOwner) {

      return false;

    }

    if (traveler.userId !== model.currentUserId) {

      return true;

    }

    if (traveler.role === "owner" && ownerCount > 1) {

      return true;

    }

    return false;

  }



  function closeInviteSheet() {

    setInviteOpen(false);

  }



  return (

    <div className={styles.page}>

      <Link href={buildSettingsHubHref(model.tripId)} className={styles.back}>

        <IconBack className={styles.backIcon} aria-hidden />

        <span>{t("back")}</span>

      </Link>



      <header className={styles.header}>

        <h1 className={styles.title}>{t("pageTitle")}</h1>

        <p className={styles.lead}>{t("lead")}</p>

      </header>



      {actionError ? (

        <p className={styles.inlineError} role="alert">

          {actionError}

        </p>

      ) : null}

      {actionSuccess ? (

        <p className={styles.inlineSuccess} role="status">

          {actionSuccess}

        </p>

      ) : null}



      <section aria-labelledby="travelers-section-label">

        <h2 id="travelers-section-label" className={styles.sectionLabel}>

          {t("travelersSectionCount", { count: model.travelers.length })}

        </h2>

        <div className={styles.group} role="list">

          {model.travelers.map((traveler) => (

            <div key={traveler.membershipId} className={styles.travelerRow} role="listitem">

              <span className={styles.avatar} aria-hidden>

                {travelerInitials(traveler.name)}

              </span>

              <div className={styles.travelerCopy}>

                <p className={styles.travelerName} dir="auto">

                  {traveler.name}

                </p>

                <p className={styles.travelerMeta}>{subtitleForTraveler(traveler)}</p>

                {model.isOwner && traveler.email ? (

                  <p className={styles.travelerEmail} dir="ltr">

                    {traveler.email}

                  </p>

                ) : null}

              </div>

              {travelerHasManageMenu(traveler) ? (

                <button

                  type="button"

                  className={styles.menuButton}

                  aria-label={t("manageTraveler", { name: traveler.name })}

                  onClick={() => setManageTraveler(traveler)}

                >

                  <IconMore aria-hidden />

                </button>

              ) : null}

            </div>

          ))}

          {model.isOwner ? (

            <button

              type="button"

              className={styles.inviteActionRow}

              onClick={() => setInviteOpen(true)}

            >

              <span className={styles.inviteActionIcon} aria-hidden>

                +

              </span>

              {t("inviteTraveler")}

            </button>

          ) : null}

        </div>

      </section>



      {model.isOwner && model.activeInvitations.length > 0 ? (

        <section aria-labelledby="pending-invites-label">

          <h2 id="pending-invites-label" className={styles.sectionLabel}>

            {t("pendingInvitations")}

          </h2>

          <div className={styles.group} role="list">

            {model.activeInvitations.map((invitation) => (

              <div key={invitation.id} className={styles.inviteRow} role="listitem">

                <div className={styles.inviteCopy}>

                  <p className={styles.inviteRole}>

                    {t("inviteAs", { role: roleLabel(invitation.role) })}

                  </p>

                  <p className={styles.inviteMeta}>

                    {t("expires", {

                      date: new Date(invitation.expiresAt).toLocaleDateString(

                        intlLocale,

                      ),

                    })}

                  </p>

                </div>

                <button

                  type="button"

                  className={styles.revokeButton}

                  onClick={() => setConfirm({ kind: "revoke", invitation })}

                >

                  {t("revoke")}

                </button>

              </div>

            ))}

          </div>

          {revokeError ? (

            <p className={styles.inlineError} role="alert">

              {revokeError}

            </p>

          ) : null}

        </section>

      ) : null}



      {soleOwner || showLeaveTrip ? (

        <section aria-labelledby="trip-access-label">

          <h2 id="trip-access-label" className={styles.sectionLabel}>

            {t("tripAccessSection")}

          </h2>

          {soleOwner ? (

            <p className={styles.soleOwnerNote}>{t("soleOwnerLeaveHint")}</p>

          ) : (

            <div className={styles.group}>

              <button

                type="button"

                className={styles.destructiveRow}

                onClick={() => setConfirm({ kind: "leave" })}

              >

                <span className={styles.destructiveRowLabel}>{t("leaveTrip")}</span>

                <span className={styles.destructiveRowHint}>{t("leaveTripHint")}</span>

              </button>

            </div>

          )}

        </section>

      ) : null}



      <TravelersSettingsSheet

        open={Boolean(manageTraveler)}

        title={t("manageSheetTitle")}

        subtitle={manageTraveler?.name}

        meta={manageTraveler ? subtitleForTraveler(manageTraveler) : undefined}

        onClose={() => setManageTraveler(null)}

      >

        {manageTraveler ? (

          <ul className={styles.manageActions}>

            {manageTraveler.userId !== model.currentUserId &&

            manageTraveler.role === "member" ? (

              <li>

                <button

                  type="button"

                  className={styles.manageAction}

                  onClick={() => runRoleChange(manageTraveler, "owner")}

                >

                  {t("makeOwner")}

                </button>

              </li>

            ) : null}

            {manageTraveler.userId !== model.currentUserId &&

            manageTraveler.role === "owner" ? (

              <li>

                <button

                  type="button"

                  className={styles.manageAction}

                  onClick={() => {

                    setManageTraveler(null);

                    setConfirm({ kind: "demote", traveler: manageTraveler });

                  }}

                >

                  {t("makeMember")}

                </button>

              </li>

            ) : null}

            {manageTraveler.userId !== model.currentUserId ? (

              <li>

                <button

                  type="button"

                  className={styles.manageAction}

                  data-tone="danger"

                  onClick={() => {

                    setManageTraveler(null);

                    setConfirm({ kind: "remove", traveler: manageTraveler });

                  }}

                >

                  {t("removeFromTrip")}

                </button>

              </li>

            ) : null}

            {manageTraveler.userId === model.currentUserId &&

            manageTraveler.role === "owner" &&

            ownerCount > 1 ? (

              <li>

                <button

                  type="button"

                  className={styles.manageAction}

                  onClick={() => {

                    setManageTraveler(null);

                    setConfirm({ kind: "demote", traveler: manageTraveler });

                  }}

                >

                  {t("makeMember")}

                </button>

              </li>

            ) : null}

          </ul>

        ) : null}

      </TravelersSettingsSheet>



      <TravelersSettingsSheet

        open={inviteOpen}

        title={t("inviteTraveler")}

        onClose={closeInviteSheet}

      >

        <form action={inviteAction} className={styles.inviteForm}>

          <input type="hidden" name="tripId" value={model.tripId} />

          <p className={styles.inviteLead}>{t("inviteLead")}</p>

          <fieldset className={styles.roleFieldset}>

            <legend className={styles.roleLegend}>{t("roleSection")}</legend>

            <div className={styles.roleOptions}>

              <label className={styles.roleOption}>

                <input type="radio" name="role" value="member" defaultChecked />

                {roleLabel("member")}

              </label>

              <label className={styles.roleOption}>

                <input type="radio" name="role" value="owner" />

                {roleLabel("owner")}

              </label>

            </div>

          </fieldset>

          {inviteError ? (

            <p className={styles.inlineError} role="alert">

              {inviteError}

            </p>

          ) : null}

          {!inviteState.inviteUrl ? (

            <button

              type="submit"

              className={styles.submitPrimary}

              disabled={invitePending}

            >

              {t("createInviteLink")}

            </button>

          ) : null}

          {inviteState.inviteUrl ? (

            <div className={styles.copyBlock}>

              <p className={styles.copyBlockLabel}>{t("invitationLink")}</p>

              <div className={styles.copyRow}>

                <Input

                  readOnly

                  className={styles.linkInput}

                  value={inviteState.inviteUrl}

                  aria-label={t("invitationLink")}

                />

                <CopyLinkButton url={inviteState.inviteUrl} />

              </div>

              <p className={styles.copyHint}>{t("inviteExpiryHint")}</p>

              <p className={styles.copyHint}>{t("copyLinkHint")}</p>

            </div>

          ) : (

            <p className={styles.copyHint}>{t("inviteExpiryHint")}</p>

          )}

        </form>

      </TravelersSettingsSheet>



      <TravelersConfirmDialog

        open={confirm?.kind === "remove"}

        title={t("removeTraveler")}

        description={t("removeConfirm", {

          name: confirm?.kind === "remove" ? confirm.traveler.name : "",

        })}

        confirmLabel={t("removeFromTrip")}

        destructive

        isPending={pending}

        onCancel={() => setConfirm(null)}

        onConfirm={() => {

          if (confirm?.kind === "remove") {

            runRemove(confirm.traveler);

          }

        }}

      />



      <TravelersConfirmDialog

        open={confirm?.kind === "leave"}

        title={t("leaveTrip")}

        description={t("leaveConfirm")}

        confirmLabel={t("leaveTrip")}

        destructive

        isPending={pending}

        onCancel={() => setConfirm(null)}

        onConfirm={runLeave}

      />



      <TravelersConfirmDialog

        open={confirm?.kind === "demote"}

        title={t("makeMember")}

        description={t("demoteOwnerConfirm")}

        confirmLabel={t("makeMember")}

        destructive

        isPending={pending}

        onCancel={() => setConfirm(null)}

        onConfirm={() => {

          if (confirm?.kind === "demote") {

            runRoleChange(confirm.traveler, "member");

          }

        }}

      />



      <TravelersConfirmDialog

        open={confirm?.kind === "revoke"}

        title={t("revoke")}

        description={t("revokeConfirm")}

        confirmLabel={t("revoke")}

        destructive

        isPending={revokePending}

        onCancel={() => setConfirm(null)}

        onConfirm={() => {

          if (confirm?.kind === "revoke") {

            startTransition(() => {

              const formData = new FormData();

              formData.set("tripId", model.tripId);

              formData.set("invitationId", confirm.invitation.id);

              revokeAction(formData);

              setConfirm(null);

              router.refresh();

            });

          }

        }}

      />

    </div>

  );

}



function CopyLinkButton({ url }: { url: string }) {

  const t = useTranslations("TravelersSettings");

  const [copied, setCopied] = useState(false);



  async function handleCopy() {

    try {

      await navigator.clipboard.writeText(url);

      setCopied(true);

    } catch {

      setCopied(false);

    }

  }



  return (

    <button type="button" className={styles.copyButton} onClick={handleCopy}>

      {copied ? t("linkCopied") : t("copyLink")}

    </button>

  );

}

