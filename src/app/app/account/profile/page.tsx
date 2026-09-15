import { ProfileContent } from "@/features/account/ProfileContent";

type ProfilePageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  return <ProfileContent returnTo={params.returnTo} />;
}
