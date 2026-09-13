import { redirect } from "next/navigation";

export default async function MemoriesLegacyRedirectPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  redirect(`/app/trips/${tripId}/more`);
}
