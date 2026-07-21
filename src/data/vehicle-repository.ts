import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getDatabase } from "@/db";
import { vehicleImages, vehicles } from "@/db/schema";
import { getR2Environment, ServerConfigurationError } from "@/lib/env/server";
import type { Vehicle, VehicleImage } from "@/types/vehicle";
import { bodyStyles, inventoryStatuses, publicationStatuses } from "@/types/vehicle";

type VehicleRow = typeof vehicles.$inferSelect;
type VehicleImageRow = typeof vehicleImages.$inferSelect;

const vehicleRowSchema = z.object({
  id: z.string(),
  slug: z.string(),
  publicationStatus: z.enum(publicationStatuses),
  inventoryStatus: z.enum(inventoryStatuses),
  featured: z.boolean(),
  year: z.number().int(),
  make: z.string(),
  model: z.string(),
  trim: z.string(),
  bodyStyle: z.enum(bodyStyles),
  price: z.number().int().nonnegative(),
  currency: z.string().length(3),
  mileage: z.number().int().nonnegative(),
  mileageUnit: z.enum(["mi", "km"]),
  fuel: z.string(),
  engine: z.string(),
  drivetrain: z.string(),
  transmission: z.string(),
  exterior: z.string(),
  interior: z.string(),
  vin: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().nullable(),
}).strict();

function imageSource(image: VehicleImageRow) {
  if (image.sourceUrl) {
    return image.sourceUrl;
  }

  if (!image.objectKey) {
    throw new Error("Vehicle image has no configured source.");
  }

  try {
    const baseUrl = getR2Environment().publicBaseUrl.replace(/\/$/, "");
    return `${baseUrl}/${encodeURI(image.objectKey)}`;
  } catch (error) {
    if (error instanceof ServerConfigurationError) {
      throw new Error("Published R2 image host is not configured.");
    }

    throw error;
  }
}

function mapImage(image: VehicleImageRow): VehicleImage {
  return {
    id: image.id,
    src: imageSource(image),
    alt: image.altText,
    sortOrder: image.sortOrder,
  };
}

function mapVehicle(row: VehicleRow, images: VehicleImageRow[]): Vehicle {
  const parsed = vehicleRowSchema.safeParse(row);
  if (!parsed.success) throw new Error("Vehicle data failed runtime validation.");
  const valid = parsed.data;
  return {
    id: valid.id,
    slug: valid.slug,
    publicationStatus: valid.publicationStatus,
    status: valid.inventoryStatus,
    featured: valid.featured,
    year: valid.year,
    make: valid.make,
    model: valid.model,
    trim: valid.trim,
    bodyStyle: valid.bodyStyle,
    price: valid.price,
    mileage: valid.mileage,
    mileageUnit: valid.mileageUnit,
    fuel: valid.fuel,
    engine: valid.engine,
    drivetrain: valid.drivetrain,
    transmission: valid.transmission,
    exterior: valid.exterior,
    interior: valid.interior,
    ...(valid.vin ? { vin: valid.vin } : {}),
    images: images.map(mapImage),
  };
}

async function attachImages(rows: VehicleRow[]) {
  if (rows.length === 0) {
    return [];
  }

  const db = getDatabase();
  const images = await db
    .select()
    .from(vehicleImages)
    .where(inArray(vehicleImages.vehicleId, rows.map((row) => row.id)))
    .orderBy(asc(vehicleImages.vehicleId), asc(vehicleImages.sortOrder));

  const imagesByVehicle = new Map<string, VehicleImageRow[]>();

  for (const image of images) {
    if (!image.vehicleId) {
      continue;
    }
    const current = imagesByVehicle.get(image.vehicleId) ?? [];
    current.push(image);
    imagesByVehicle.set(image.vehicleId, current);
  }

  return rows.map((row) => mapVehicle(row, imagesByVehicle.get(row.id) ?? []));
}

export async function listPublishedVehicles() {
  const rows = await getDatabase()
    .select()
    .from(vehicles)
    .where(eq(vehicles.publicationStatus, "published"))
    .orderBy(asc(vehicles.make), asc(vehicles.model), asc(vehicles.year));

  return attachImages(rows);
}

export async function listFeaturedPublishedVehicles() {
  const rows = await getDatabase()
    .select()
    .from(vehicles)
    .where(
      and(
        eq(vehicles.publicationStatus, "published"),
        eq(vehicles.featured, true),
      ),
    )
    .orderBy(asc(vehicles.make), asc(vehicles.model), asc(vehicles.year));

  return attachImages(rows);
}

export async function findPublishedVehicleBySlug(slug: string) {
  const rows = await getDatabase()
    .select()
    .from(vehicles)
    .where(
      and(
        eq(vehicles.slug, slug),
        eq(vehicles.publicationStatus, "published"),
      ),
    )
    .limit(1);

  return (await attachImages(rows))[0];
}

export async function findPublishedVehicleById(id: string) {
  const rows = await getDatabase()
    .select()
    .from(vehicles)
    .where(
      and(eq(vehicles.id, id), eq(vehicles.publicationStatus, "published")),
    )
    .limit(1);

  return (await attachImages(rows))[0];
}

export async function listAdminVehicles() {
  const rows = await getDatabase()
    .select()
    .from(vehicles)
    .orderBy(asc(vehicles.make), asc(vehicles.model), asc(vehicles.year));

  return attachImages(rows);
}

export async function findAdminVehicleById(id: string) {
  const rows = await getDatabase()
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, id))
    .limit(1);

  return (await attachImages(rows))[0];
}
