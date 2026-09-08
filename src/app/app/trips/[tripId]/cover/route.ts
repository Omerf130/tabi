import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db/connect";
import { requireTripMember } from "@/features/trips/authorization";
import { readTripCoverBlob } from "@/features/trips/cover/blob-storage";
import { Trip } from "@/models/Trip";

export async function GET(
  _request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { tripId } = await context.params;
  await requireTripMember(tripId);

  await connectDb();
  const trip = await Trip.findById(tripId).lean();
  if (!trip?.coverImage?.pathname) {
    notFound();
  }

  const blob = await readTripCoverBlob(trip.coverImage.pathname);

  return new Response(blob.stream, {
    headers: {
      "Content-Type": blob.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
