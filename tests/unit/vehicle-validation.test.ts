import { describe, expect, it } from "vitest";

import {
  proposeVehicleSlug,
  vehicleMutationSchema,
} from "@/lib/vehicle-validation";

const validVehicle = {
  slug: "2023-maserati-ghibli-modena-q4",
  publicationStatus: "published",
  inventoryStatus: "available",
  featured: true,
  year: 2023,
  make: "Maserati",
  model: "Ghibli",
  trim: "Modena Q4",
  bodyStyle: "sedan",
  price: 78990,
  currency: "USD",
  mileage: 12450,
  mileageUnit: "mi",
  fuel: "Gasoline",
  engine: "3.0L Twin-Turbo V6",
  drivetrain: "AWD",
  transmission: "Automatic",
  exterior: "Nero Ribelle",
  interior: "Cuoio Leather",
  vin: "ZAM57YSA1P1234567",
} as const;

describe("vehicleMutationSchema", () => {
  it("accepts the approved vehicle shape", () => {
    expect(vehicleMutationSchema.safeParse(validVehicle).success).toBe(true);
  });

  it("rejects unknown fields and invalid numeric values", () => {
    const result = vehicleMutationSchema.safeParse({
      ...validVehicle,
      price: -1,
      fabricatedField: true,
    });

    expect(result.success).toBe(false);
  });

  it("rejects malformed slugs", () => {
    expect(
      vehicleMutationSchema.safeParse({ ...validVehicle, slug: "Bad Slug" })
        .success,
    ).toBe(false);
  });
});

describe("proposeVehicleSlug", () => {
  it("normalizes factual vehicle fields", () => {
    expect(
      proposeVehicleSlug({
        year: 2024,
        make: "Mercedes-Benz",
        model: "A-Class",
        trim: "AMG 35",
      }),
    ).toBe("2024-mercedes-benz-a-class-amg-35");
  });
});
