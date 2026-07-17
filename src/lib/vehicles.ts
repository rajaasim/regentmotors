import { vehicles } from "@/data/vehicles";
import type { BodyStyle } from "@/types/vehicle";

export function getVehicles() {
  return vehicles;
}

export function getFeaturedVehicles() {
  return vehicles.filter((vehicle) => vehicle.featured);
}

export function getVehicleBySlug(slug: string) {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}

export function getVehiclesByBodyStyle(bodyStyle: BodyStyle) {
  return vehicles.filter((vehicle) => vehicle.bodyStyle === bodyStyle);
}
