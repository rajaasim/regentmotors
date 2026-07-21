import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { VehicleImagesManager } from "@/components/admin/vehicle-images-manager";
import { findAdminVehicleById } from "@/data/vehicle-repository";

export const metadata: Metadata = { title: "Edit vehicle", robots: { index: false, follow: false } };
type PageProps = { params: Promise<{ id: string }> };

export default async function EditVehiclePage({ params }: PageProps) {
  const { id } = await params; const vehicle = await findAdminVehicleById(id); if (!vehicle) notFound();
  return <div><p className="eyebrow">Inventory administration</p><h1 className="mt-3 font-serif text-4xl text-white">Edit {vehicle.year} {vehicle.make} {vehicle.model}</h1><VehicleForm vehicle={vehicle} /><VehicleImagesManager vehicleId={vehicle.id} images={vehicle.images} /></div>;
}
