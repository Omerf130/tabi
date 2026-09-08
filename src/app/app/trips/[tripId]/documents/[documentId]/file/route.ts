import { notFound } from "next/navigation";
import { requireTripMember } from "@/features/trips/authorization";
import { isValidObjectId } from "@/features/trips/object-id";
import { readTravelDocumentBlob } from "@/features/documents/blob-storage";
import { getTravelDocumentPathname } from "@/features/documents/document-domain";
import { contentDispositionFilename } from "@/features/documents/sanitize-filename";

export async function GET(
  request: Request,
  context: { params: Promise<{ tripId: string; documentId: string }> },
) {
  const { tripId, documentId } = await context.params;

  if (!isValidObjectId(tripId) || !isValidObjectId(documentId)) {
    notFound();
  }

  await requireTripMember(tripId);

  const fileMeta = await getTravelDocumentPathname(tripId, documentId);
  if (!fileMeta) {
    notFound();
  }

  let blob: Awaited<ReturnType<typeof readTravelDocumentBlob>>;
  try {
    blob = await readTravelDocumentBlob(fileMeta.pathname);
  } catch {
    notFound();
  }

  const url = new URL(request.url);
  const download = url.searchParams.get("download") === "1";
  const filename = contentDispositionFilename(
    fileMeta.originalFilename ?? "document",
  );
  const dispositionType = download ? "attachment" : "inline";

  return new Response(blob.stream, {
    headers: {
      "Content-Type": fileMeta.contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `${dispositionType}; filename="${filename}"`,
    },
  });
}
