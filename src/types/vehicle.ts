export const bodyStyles = [
  "sedan",
  "suv",
  "coupe",
  "convertible",
  "hatchback",
  "truck",
] as const;

export type BodyStyle = (typeof bodyStyles)[number];

export type VehicleStatus = "available" | "reserved" | "sold";

export type Vehicle = {
  id: string;
  slug: string;
  status: VehicleStatus;
  featured: boolean;
  year: number;
  make: string;
  model: string;
  trim: string;
  bodyStyle: BodyStyle;
  price: number;
  mileage: number;
  mileageUnit: "mi" | "km";
  fuel: string;
  engine: string;
  drivetrain: string;
  transmission: string;
  exterior: string;
  interior: string;
  vin?: string;
  images: Array<{ src: string; alt: string }>;
};
