import type { Metadata } from "next";
import { VehicleForm } from "@/components/admin/vehicle-form";

export const metadata: Metadata = { title: "Add vehicle", robots: { index: false, follow: false } };

export default function NewVehiclePage() {
  return <div><p className="eyebrow">Inventory administration</p><h1 className="mt-3 font-serif text-4xl text-white">Add vehicle</h1><p className="mt-3 text-sm text-muted">Create the factual record as a draft, then add approved imagery before publishing.</p><VehicleForm /></div>;
}
