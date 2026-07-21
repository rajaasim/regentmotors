import "server-only";

import { eq } from "drizzle-orm";

import { getDatabase } from "@/db";
import { vehicleImages, vehicles } from "@/db/schema";
import { recordAdminAudit } from "@/data/admin-audit";
import type { VehicleMutationInput } from "@/lib/vehicle-validation";
import { createVehicleId } from "@/lib/vehicle-validation";

export class VehicleMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VehicleMutationError";
  }
}

async function requirePublishedVehicleImage(vehicleId: string) {
  const image = await getDatabase()
    .select({ id: vehicleImages.id })
    .from(vehicleImages)
    .where(eq(vehicleImages.vehicleId, vehicleId))
    .limit(1);

  if (!image[0]) {
    throw new VehicleMutationError(
      "A published vehicle must have at least one image.",
    );
  }
}

export async function createAdminVehicle(
  input: VehicleMutationInput,
  actorUserId: string,
) {
  const id = createVehicleId();
  const db = getDatabase();

  if (input.publicationStatus !== "draft") {
    throw new VehicleMutationError(
      "New vehicles must be created as drafts.",
    );
  }

  await db.insert(vehicles).values({
    id,
    ...input,
    publishedAt: null,
  });

  await recordAdminAudit({
    actorUserId,
    action: "vehicle.created",
    entityType: "vehicle",
    entityId: id,
    summary: { slug: input.slug, publicationStatus: input.publicationStatus },
  });

  return id;
}

export async function updateAdminVehicle(
  id: string,
  input: VehicleMutationInput,
  actorUserId: string,
) {
  const db = getDatabase();
  const existing = await db
    .select({ id: vehicles.id, publishedAt: vehicles.publishedAt })
    .from(vehicles)
    .where(eq(vehicles.id, id))
    .limit(1);

  if (!existing[0]) {
    throw new VehicleMutationError("Vehicle was not found.");
  }

  if (input.publicationStatus === "published") {
    await requirePublishedVehicleImage(id);
  }

  const updated = await db
    .update(vehicles)
    .set({
      ...input,
      publishedAt:
        input.publicationStatus === "published"
          ? (existing[0].publishedAt ?? new Date())
          : null,
      updatedAt: new Date(),
    })
    .where(eq(vehicles.id, id))
    .returning({ id: vehicles.id });

  if (!updated[0]) {
    throw new VehicleMutationError("Vehicle could not be updated.");
  }

  await recordAdminAudit({
    actorUserId,
    action: "vehicle.updated",
    entityType: "vehicle",
    entityId: id,
    summary: { slug: input.slug, publicationStatus: input.publicationStatus },
  });
}
