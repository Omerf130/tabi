import { requireUser } from "@/features/auth/session";
import { listTripInvitations } from "@/features/trips/invitations/queries";
import { listTripMembers } from "@/features/trips/members/queries";
import { requireTripMember } from "@/features/trips/authorization";
import { AppPage } from "@/features/app-shell/AppPage";
import { CreateInviteForm } from "./CreateInviteForm";
import { InvitationRow } from "./InvitationRow";
import { MemberRow } from "./MemberRow";
import styles from "./MembersPage.module.scss";

type MembersPageContentProps = {
  tripId: string;
};

export async function MembersPageContent({ tripId }: MembersPageContentProps) {
  const user = await requireUser();
  const trip = await requireTripMember(tripId);
  const members = await listTripMembers(tripId);
  const invitations = trip.role === "owner" ? await listTripInvitations(tripId) : [];
  const isOwnerView = trip.role === "owner";

  return (
    <AppPage width="content">
      <section className={styles.memberList}>
        {members.map((member) => (
          <MemberRow
            key={member.membershipId}
            tripId={tripId}
            member={member}
            isOwnerView={isOwnerView}
            currentUserId={user.id}
          />
        ))}
      </section>

      {isOwnerView ? (
        <>
          <CreateInviteForm tripId={tripId} />
          {invitations.length > 0 ? (
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
        </>
      ) : null}
    </AppPage>
  );
}
