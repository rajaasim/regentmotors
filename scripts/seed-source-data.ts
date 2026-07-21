import { and, eq } from "drizzle-orm";
import { z } from "zod";

import * as schema from "../src/db/schema";
import { createDatabaseConnection } from "../src/db/factory";
import { defaultSiteSettings } from "../src/data/site-settings-defaults";
import { vehicles as sourceVehicles } from "../src/data/vehicles";

const databaseUrl = z.url().refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://"), "DATABASE_URL must use PostgreSQL.").parse(process.env.DATABASE_URL);

async function main() {
  const connection = createDatabaseConnection(databaseUrl, 1);
  const db = connection.database;

  try {
    for (const vehicle of sourceVehicles) {
  await db.insert(schema.vehicles).values({
    id: vehicle.id,
    slug: vehicle.slug,
    publicationStatus: vehicle.publicationStatus ?? "published",
    inventoryStatus: vehicle.status,
    featured: vehicle.featured,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    bodyStyle: vehicle.bodyStyle,
    price: vehicle.price,
    currency: "USD",
    mileage: vehicle.mileage,
    mileageUnit: vehicle.mileageUnit,
    fuel: vehicle.fuel,
    engine: vehicle.engine,
    drivetrain: vehicle.drivetrain,
    transmission: vehicle.transmission,
    exterior: vehicle.exterior,
    interior: vehicle.interior,
    vin: vehicle.vin,
    publishedAt: vehicle.publicationStatus === "draft" ? null : new Date(),
  }).onConflictDoUpdate({
    target: schema.vehicles.id,
    set: {
      slug: vehicle.slug,
      publicationStatus: vehicle.publicationStatus ?? "published",
      inventoryStatus: vehicle.status,
      featured: vehicle.featured,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      bodyStyle: vehicle.bodyStyle,
      price: vehicle.price,
      mileage: vehicle.mileage,
      mileageUnit: vehicle.mileageUnit,
      fuel: vehicle.fuel,
      engine: vehicle.engine,
      drivetrain: vehicle.drivetrain,
      transmission: vehicle.transmission,
      exterior: vehicle.exterior,
      interior: vehicle.interior,
      vin: vehicle.vin,
      updatedAt: new Date(),
    },
  });

  for (const [sortOrder, image] of vehicle.images.entries()) {
    const existing = await db.select({ id: schema.vehicleImages.id }).from(schema.vehicleImages).where(and(eq(schema.vehicleImages.vehicleId, vehicle.id), eq(schema.vehicleImages.sortOrder, sortOrder))).limit(1);
    if (existing[0]) {
      await db.update(schema.vehicleImages).set({ sourceUrl: image.src, objectKey: null, altText: image.alt, mimeType: "image/jpeg", sortOrder }).where(eq(schema.vehicleImages.id, existing[0].id));
    } else {
      await db.insert(schema.vehicleImages).values({ vehicleId: vehicle.id, sourceUrl: image.src, mimeType: "image/jpeg", altText: image.alt, sortOrder });
    }
  }
    }

    await db.insert(schema.siteSettings).values({ id: "default", ...defaultSiteSettings }).onConflictDoUpdate({
      target: schema.siteSettings.id,
      set: { ...defaultSiteSettings, updatedAt: new Date() },
    });

    process.stdout.write(`Seeded ${sourceVehicles.length} client-supplied vehicles and the default site settings record.\n`);
  } finally {
    await connection.client.end();
  }
}

void main().catch(() => {
  process.stderr.write("Source-data seed failed.\n");
  process.exitCode = 1;
});
