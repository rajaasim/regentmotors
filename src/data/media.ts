import "server-only";

import { and, count, eq, gt, isNull, ne } from "drizzle-orm";

import { getDatabase } from "@/db";
import { pendingMediaUploads, vehicleImages } from "@/db/schema";
import { recordAdminAudit } from "@/data/admin-audit";
import type { MediaEditInput, UploadFinalizationInput, UploadIntentInput } from "@/lib/media-validation";
import { createR2ObjectKey, createR2UploadUrl, deleteR2Object, getR2PublicUrl, inspectR2Object } from "@/lib/storage/r2";

export async function createMediaUploadIntent(input: UploadIntentInput, staffId: string) {
  const recent = await getDatabase()
    .select({ count: count() })
    .from(pendingMediaUploads)
    .where(and(
      eq(pendingMediaUploads.requestedBy, staffId),
      gt(pendingMediaUploads.createdAt, new Date(Date.now() - 60_000)),
    ));
  if ((recent[0]?.count ?? 0) >= 20) throw new Error("Upload rate limit exceeded.");
  const objectKey = createR2ObjectKey(input);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const inserted = await getDatabase().insert(pendingMediaUploads).values({
    requestedBy: staffId,
    vehicleId: input.vehicleId ?? null,
    objectKey,
    expectedMimeType: input.mimeType,
    expectedByteSize: input.byteSize,
    expiresAt,
  }).returning({ id: pendingMediaUploads.id });
  const upload = inserted[0];
  if (!upload) throw new Error("Upload intent was not stored.");
  const uploadUrl = await createR2UploadUrl(input, objectKey);
  return { uploadId: upload.id, uploadUrl, expiresAt: expiresAt.toISOString() };
}

export async function finalizeMediaUpload(input: UploadFinalizationInput, staffId: string) {
  const db = getDatabase();
  const pending = await db.select().from(pendingMediaUploads).where(and(
    eq(pendingMediaUploads.id, input.uploadId),
    eq(pendingMediaUploads.requestedBy, staffId),
    gt(pendingMediaUploads.expiresAt, new Date()),
    isNull(pendingMediaUploads.finalizedAt),
  )).limit(1);
  const upload = pending[0];
  if (!upload) throw new Error("Upload intent is missing or expired.");
  const object = await inspectR2Object(upload.objectKey);
  if (object.ContentType !== upload.expectedMimeType || object.ContentLength !== upload.expectedByteSize) {
    throw new Error("Uploaded object does not match the approved intent.");
  }
  const inserted = await db.insert(vehicleImages).values({
    vehicleId: upload.vehicleId,
    objectKey: upload.objectKey,
    mimeType: upload.expectedMimeType,
    byteSize: upload.expectedByteSize,
    width: input.width,
    height: input.height,
    altText: input.altText,
    sortOrder: input.sortOrder,
  }).returning({ id: vehicleImages.id });
  await db.update(pendingMediaUploads).set({ finalizedAt: new Date() }).where(eq(pendingMediaUploads.id, upload.id));
  const media = inserted[0];
  if (!media) throw new Error("Uploaded image metadata was not stored.");
  await recordAdminAudit({
    actorUserId: staffId,
    action: "media.created",
    entityType: "vehicle_image",
    entityId: media.id,
    summary: { vehicleId: upload.vehicleId },
  });
  return { id: media.id, url: getR2PublicUrl(upload.objectKey) };
}

export async function updateVehicleImage(id: string, input: MediaEditInput, staffId: string) {
  const updated = await getDatabase()
    .update(vehicleImages)
    .set(input)
    .where(eq(vehicleImages.id, id))
    .returning({ id: vehicleImages.id, vehicleId: vehicleImages.vehicleId });
  const image = updated[0];
  if (!image) throw new Error("Image was not found.");
  await recordAdminAudit({
    actorUserId: staffId,
    action: "media.updated",
    entityType: "vehicle_image",
    entityId: id,
    summary: { vehicleId: image.vehicleId, sortOrder: input.sortOrder },
  });
}

export async function removeVehicleImage(id: string, staffId: string) {
  const db = getDatabase();
  const rows = await db
    .select({
      id: vehicleImages.id,
      vehicleId: vehicleImages.vehicleId,
      objectKey: vehicleImages.objectKey,
    })
    .from(vehicleImages)
    .where(eq(vehicleImages.id, id))
    .limit(1);
  const image = rows[0];
  if (!image) throw new Error("Image was not found.");

  const vehicleId = image.vehicleId;
  if (vehicleId) {
    const otherImages = await db
      .select({ id: vehicleImages.id })
      .from(vehicleImages)
      .where(and(eq(vehicleImages.vehicleId, vehicleId), ne(vehicleImages.id, id)))
      .limit(1);
    const publishedVehicle = await db.query.vehicles.findFirst({
      columns: { id: true },
      where: (vehicle, operators) => operators.and(
        operators.eq(vehicle.id, vehicleId),
        operators.eq(vehicle.publicationStatus, "published"),
      ),
    });
    if (publishedVehicle && !otherImages[0]) {
      throw new Error("A published vehicle must retain at least one image.");
    }
  }

  await db.delete(vehicleImages).where(eq(vehicleImages.id, id));
  let cleanupDeferred = false;
  if (image.objectKey) {
    try {
      await deleteR2Object(image.objectKey);
      await db.delete(pendingMediaUploads).where(eq(pendingMediaUploads.objectKey, image.objectKey));
    } catch {
      cleanupDeferred = true;
      await db.update(pendingMediaUploads).set({ finalizedAt: null, expiresAt: new Date() }).where(eq(pendingMediaUploads.objectKey, image.objectKey));
    }
  }
  await recordAdminAudit({
    actorUserId: staffId,
    action: "media.removed",
    entityType: "vehicle_image",
    entityId: id,
    summary: { vehicleId: image.vehicleId, cleanupDeferred },
  });
}
