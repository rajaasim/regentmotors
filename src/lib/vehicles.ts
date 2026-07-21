import { DatabaseUnavailableError } from "@/db";
import {
  findPublishedVehicleById,
  findPublishedVehicleBySlug,
  listFeaturedPublishedVehicles,
  listPublishedVehicles,
} from "@/data/vehicle-repository";
import { vehicles } from "@/data/vehicles";
import type { BodyStyle } from "@/types/vehicle";

export async function getVehicles() {
  try {
    return await listPublishedVehicles();
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) return vehicles;
    throw error;
  }
}

export async function getFeaturedVehicles() {
  try {
    return await listFeaturedPublishedVehicles();
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) return vehicles.filter((vehicle) => vehicle.featured);
    throw error;
  }
}

export async function getVehicleBySlug(slug: string) {
  try {
    return await findPublishedVehicleBySlug(slug);
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) return vehicles.find((vehicle) => vehicle.slug === slug);
    throw error;
  }
}

export async function getVehiclesByBodyStyle(bodyStyle: BodyStyle) {
  return (await getVehicles()).filter((vehicle) => vehicle.bodyStyle === bodyStyle);
}

export async function getVehicleById(id: string) {
  try {
    return await findPublishedVehicleById(id);
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) return vehicles.find((vehicle) => vehicle.id === id);
    throw error;
  }
}
