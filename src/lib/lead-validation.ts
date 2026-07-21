import { z } from "zod";

export const leadFormTypes = [
  "contact",
  "test_drive",
  "availability",
  "car_finder",
  "financing",
] as const;

const optionalEmail = z
  .union([z.string().trim().email().max(254), z.literal("")])
  .optional();

const optionalPhone = z
  .union([
    z.string().trim().min(7).max(40).regex(/^[+()\-\s.\d]+$/),
    z.literal(""),
  ])
  .optional();

const approvedPayloadSchema = z
  .object({
    make: z.string().trim().max(80).optional(),
    model: z.string().trim().max(80).optional(),
    yearRange: z.string().trim().max(40).optional(),
    maxBudget: z.string().trim().max(40).optional(),
    maxMileage: z.string().trim().max(40).optional(),
    preferredContact: z.enum(["email", "phone"]).optional(),
  })
  .strict();

export const leadSchema = z
  .object({
    formType: z.enum(leadFormTypes),
    fullName: z.string().trim().min(2).max(120),
    email: optionalEmail,
    phone: optionalPhone,
    subject: z.string().trim().max(160).optional(),
    message: z.string().trim().max(3000).optional(),
    vehicleId: z.string().trim().max(80).optional(),
    payload: approvedPayloadSchema.optional(),
    consent: z.literal(true),
    consentTextVersion: z.string().trim().min(1).max(32),
  })
  .strict()
  .refine((lead) => Boolean(lead.email || lead.phone), {
    message: "Provide an email address or phone number.",
    path: ["email"],
  });

export const leadSubmissionSchema = z
  .object({
    lead: leadSchema,
    turnstileToken: z.string().min(1).max(2048),
  })
  .strict();

export type LeadInput = z.infer<typeof leadSchema>;
