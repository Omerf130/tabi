import type { Metadata } from "next";
import { getCurrentUser } from "@/features/auth/session";
import { getPublicInviteState } from "@/features/trips/invitations/queries";
import { InviteLanding } from "@/features/trips/invitations/InviteLanding";

export const metadata: Metadata = {
  title: "הזמנה לטיול · Tabi",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const user = await getCurrentUser();
  const state = await getPublicInviteState(token, user?.id);

  return (
    <InviteLanding
      token={token}
      state={state}
      isAuthenticated={Boolean(user)}
    />
  );
}
