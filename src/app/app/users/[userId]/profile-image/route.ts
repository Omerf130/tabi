import { notFound } from "next/navigation";
import { usersShareTripMembership } from "@/features/account/profile-image/can-view-user-profile-image";
import { readUserProfileImageBlob } from "@/features/account/profile-image/blob-storage";
import { requireUser } from "@/features/auth/session";
import { connectDb } from "@/lib/db/connect";
import { isValidObjectId } from "@/features/trips/object-id";
import { User } from "@/models/User";

export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId } = await context.params;

  if (!isValidObjectId(userId)) {
    notFound();
  }

  const viewer = await requireUser();
  const allowed = await usersShareTripMembership(viewer.id, userId);
  if (!allowed) {
    notFound();
  }

  await connectDb();
  const target = await User.findById(userId).lean();
  const pathname = target?.profileImage?.pathname;
  if (!pathname) {
    notFound();
  }

  let blob: Awaited<ReturnType<typeof readUserProfileImageBlob>>;
  try {
    blob = await readUserProfileImageBlob(pathname);
  } catch {
    notFound();
  }

  return new Response(blob.stream, {
    headers: {
      "Content-Type": blob.contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
