import "server-only";

import { count, desc, eq } from "drizzle-orm";

import { getDatabase } from "@/db";
import { leads } from "@/db/schema";
import type { LeadInput } from "@/lib/lead-validation";

export const adminLeadsPageSize = 25;

export type AdminLeadSummary = {
  id: string;
  reference: string;
  formType: LeadInput["formType"];
  fullName: string;
  email: string | null;
  phone: string | null;
  vehicleDisplayName: string | null;
  createdAt: Date;
};

export type AdminLeadDetail = AdminLeadSummary & {
  subject: string | null;
  message: string | null;
  vehicleId: string | null;
  payload: Record<string, string | number | boolean> | null;
  consent: boolean;
  consentTextVersion: string;
};

export async function listAdminLeads(input: {
  page: number;
  formType?: LeadInput["formType"];
}): Promise<{ items: AdminLeadSummary[]; total: number }> {
  const database = getDatabase();
  const condition = input.formType
    ? eq(leads.formType, input.formType)
    : undefined;
  const offset = (input.page - 1) * adminLeadsPageSize;
  const [totalRow, items] = await Promise.all([
    database
      .select({ value: count() })
      .from(leads)
      .where(condition),
    database
      .select({
        id: leads.id,
        reference: leads.reference,
        formType: leads.formType,
        fullName: leads.fullName,
        email: leads.email,
        phone: leads.phone,
        vehicleDisplayName: leads.vehicleDisplayName,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .where(condition)
      .orderBy(desc(leads.createdAt))
      .limit(adminLeadsPageSize)
      .offset(offset),
  ]);

  return {
    items: items.map((item) => ({
      ...item,
      formType: normalizeLeadFormType(item.formType),
    })),
    total: totalRow[0]?.value ?? 0,
  };
}

export async function findAdminLeadById(
  id: string,
): Promise<AdminLeadDetail | null> {
  const rows = await getDatabase()
    .select({
      id: leads.id,
      reference: leads.reference,
      formType: leads.formType,
      fullName: leads.fullName,
      email: leads.email,
      phone: leads.phone,
      subject: leads.subject,
      message: leads.message,
      vehicleId: leads.vehicleId,
      vehicleDisplayName: leads.vehicleDisplayName,
      payload: leads.payload,
      consent: leads.consent,
      consentTextVersion: leads.consentTextVersion,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(eq(leads.id, id))
    .limit(1);
  const lead = rows[0];

  if (!lead) return null;

  return {
    ...lead,
    formType: normalizeLeadFormType(lead.formType),
  };
}

function normalizeLeadFormType(value: string): LeadInput["formType"] {
  if (
    value === "contact" ||
    value === "test_drive" ||
    value === "availability" ||
    value === "car_finder" ||
    value === "financing"
  ) {
    return value;
  }

  throw new Error("Stored lead has an invalid form type.");
}
