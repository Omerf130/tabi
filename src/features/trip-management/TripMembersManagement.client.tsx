"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { CreateInviteForm } from "@/features/trips/members/CreateInviteForm";
import { InvitationRow } from "@/features/trips/members/InvitationRow";
import { MemberRow } from "@/features/trips/members/MemberRow";
import type { InvitationListItem } from "@/features/trips/invitations/public-invite";
import type { TripMemberListItem } from "@/features/trips/members/owner-invariant";
import styles from "@/features/trips/members/MembersPage.module.scss";

type TripMembersManagementClientProps = {
  tripId: string;
  members: readonly TripMemberListItem[];
  invitations: readonly InvitationListItem[];
  isOwnerView: boolean;
  currentUserId: string;
};

export function TripMembersManagementClient({
  tripId,
  members,
  invitations,
  isOwnerView,
  currentUserId,
}: TripMembersManagementClientProps) {
  const [showInvite, setShowInvite] = useState(false);
  const inviteRef = useRef<HTMLDivElement>(null);

  const openInvite = () => {
    setShowInvite(true);
    requestAnimationFrame(() => {
      inviteRef.current?.querySelector<HTMLElement>("input, select, button")?.focus();
    });
  };

  return (
    <div className={styles.embedded}>
      {isOwnerView ? (
        <div className={styles.toolbar}>
          <h2 className={styles.toolbarTitle}>חברי הטיול</h2>
          {!showInvite ? (
            <Button type="button" variant="ghost" size="compact" onClick={openInvite}>
              + הזמנה חדשה
            </Button>
          ) : null}
        </div>
      ) : (
        <h2 className={styles.toolbarTitle}>חברי הטיול</h2>
      )}

      <section className={styles.memberList}>
        {members.map((member) => (
          <MemberRow
            key={member.membershipId}
            tripId={tripId}
            member={member}
            isOwnerView={isOwnerView}
            currentUserId={currentUserId}
          />
        ))}
      </section>

      {isOwnerView && showInvite ? (
        <div ref={inviteRef}>
          <CreateInviteForm tripId={tripId} onCancel={() => setShowInvite(false)} />
        </div>
      ) : null}

      {isOwnerView && invitations.length > 0 ? (
        <section>
          <h2 className={styles.sectionTitle}>הזמנות פעילות ואחרונות</h2>
          <div className={styles.inviteList}>
            {invitations.map((invitation) => (
              <InvitationRow
                key={invitation.id}
                tripId={tripId}
                invitation={invitation}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
