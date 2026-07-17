import "server-only";

import { getDatabase } from "@/db";
import { leads } from "@/db/schema";
import type { LeadInput } from "@/lib/lead-validation";

function createReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `RM-${date}-${suffix}`;
}

export async function createLead(input: LeadInput) {
  const reference = createReference();
  const db = getDatabase();

  await db.insert(leads).values({
    reference,
    formType: input.formType,
    fullName: input.fullName,
    email: input.email || null,
    phone: input.phone || null,
    subject: input.subject || null,
    message: input.message || null,
    vehicleId: input.vehicleId || null,
    payload: input.payload,
    consent: input.consent,
    consentTextVersion: input.consentTextVersion,
  });

  return { reference };
}
