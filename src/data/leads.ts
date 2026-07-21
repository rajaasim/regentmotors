import "server-only";

import { eq } from "drizzle-orm";

import { getDatabase } from "@/db";
import { leads, vehicles } from "@/db/schema";
import type { LeadInput } from "@/lib/lead-validation";

function createReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `RM-${date}-${suffix}`;
}

export async function createLead(input: LeadInput) {
  const reference = createReference();
  const db = getDatabase();
  let vehicleDisplayName: string | null = null;
  let resolvedVehicleId: string | null = null;

  if (input.vehicleId) {
    const vehicleRows = await db
      .select({ year: vehicles.year, make: vehicles.make, model: vehicles.model, trim: vehicles.trim })
      .from(vehicles)
      .where(eq(vehicles.id, input.vehicleId))
      .limit(1);
    const vehicle = vehicleRows[0];
    if (vehicle) {
      resolvedVehicleId = input.vehicleId;
      vehicleDisplayName = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`;
    }
  }

  await db.insert(leads).values({
    reference,
    formType: input.formType,
    fullName: input.fullName,
    email: input.email || null,
    phone: input.phone || null,
    subject: input.subject || null,
    message: input.message || null,
    vehicleId: resolvedVehicleId,
    vehicleDisplayName,
    payload: input.payload,
    consent: input.consent,
    consentTextVersion: input.consentTextVersion,
  });

  return { reference };
}
