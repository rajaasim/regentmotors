export const bodyStyles = [
  "sedan",
  "suv",
  "coupe",
  "convertible",
  "hatchback",
  "truck",
] as const;

export type BodyStyle = (typeof bodyStyles)[number];

export const publicationStatuses = ["draft", "published", "archived"] as const;
export type PublicationStatus = (typeof publicationStatuses)[number];

export const staffPublicationStatuses = ["draft", "published"] as const;

export const inventoryStatuses = ["available", "reserved", "sold"] as const;
export type InventoryStatus = (typeof inventoryStatuses)[number];

export type VehicleStatus = InventoryStatus;

export type VehicleImage = {
  id?: string;
  src: string;
  alt: string;
  sortOrder?: number;
};

export type Vehicle = {
  id: string;
  slug: string;
  publicationStatus?: PublicationStatus;
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
  images: VehicleImage[];
};
