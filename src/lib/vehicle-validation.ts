import { z } from "zod";

import {
  bodyStyles,
  inventoryStatuses,
  staffPublicationStatuses,
} from "@/types/vehicle";

const requiredText = (maximum: number) => z.string().trim().min(1).max(maximum);
const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((value) => value || undefined)
    .optional();

export const vehicleMutationSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(3)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug."),
    publicationStatus: z.enum(staffPublicationStatuses),
    inventoryStatus: z.enum(inventoryStatuses),
    featured: z.boolean(),
    year: z.number().int().min(1886).max(2100),
    make: requiredText(80),
    model: requiredText(100),
    trim: requiredText(120),
    bodyStyle: z.enum(bodyStyles),
    price: z.number().int().nonnegative().max(100_000_000),
    currency: z.string().trim().regex(/^[A-Z]{3}$/),
    mileage: z.number().int().nonnegative().max(10_000_000),
    mileageUnit: z.enum(["mi", "km"]),
    fuel: requiredText(80),
    engine: requiredText(120),
    drivetrain: requiredText(80),
    transmission: requiredText(100),
    exterior: requiredText(120),
    interior: requiredText(120),
    vin: optionalText(32),
  })
  .strict();

export const vehicleCreateSchema = vehicleMutationSchema;
export const vehicleUpdateSchema = vehicleMutationSchema;

export type VehicleMutationInput = z.infer<typeof vehicleMutationSchema>;

export function createVehicleId() {
  return `veh-${crypto.randomUUID()}`;
}

export function proposeVehicleSlug(input: {
  year: number;
  make: string;
  model: string;
  trim: string;
}) {
  return `${input.year}-${input.make}-${input.model}-${input.trim}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
