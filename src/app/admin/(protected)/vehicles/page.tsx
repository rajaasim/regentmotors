import type { Metadata } from "next";
import Link from "next/link";

import { listAdminVehicles } from "@/data/vehicle-repository";
import { staffPublicationStatuses } from "@/types/vehicle";

export const metadata: Metadata = {
  title: "Manage vehicles",
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ q?: string; publication?: string }> };

export default async function AdminVehiclesPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const allVehicles = await listAdminVehicles();
  const search = query.q?.trim().toLowerCase() ?? "";
  const publication = staffPublicationStatuses.find((status) => status === query.publication) ?? "all";
  const vehicles = allVehicles.filter((vehicle) => {
    if (vehicle.publicationStatus === "archived") return false;
    const matchesSearch = !search || `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} ${vehicle.slug}`.toLowerCase().includes(search);
    const matchesPublication = publication === "all" || vehicle.publicationStatus === publication;
    return matchesSearch && matchesPublication;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Inventory administration</p>
          <h1 className="mt-3 font-serif text-4xl font-medium text-white">Vehicles</h1>
        </div>
        <Link className="button button-primary" href="/admin/vehicles/new">Add vehicle</Link>
      </div>
      <form className="mt-8 grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[1fr_12rem_auto] sm:items-end" method="get">
        <label className="form-label block">Search<input className="form-control mt-2" name="q" defaultValue={query.q ?? ""} placeholder="Make, model or slug" /></label>
        <label className="form-label block">Publication<select className="form-control mt-2" name="publication" defaultValue={publication}><option value="all">All statuses</option>{staffPublicationStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
        <button className="button button-outline" type="submit">Filter</button>
      </form>
      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
        {vehicles.length === 0 ? (
          <p className="p-6 text-sm text-muted">No vehicles have been migrated yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {vehicles.map((vehicle) => (
              <li className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between" key={vehicle.id}>
                <div>
                  <p className="font-serif text-xl text-white">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                  <p className="mt-1 text-sm text-muted">{vehicle.trim} · {vehicle.status} · {vehicle.publicationStatus}</p>
                </div>
                <Link className="text-sm text-gold hover:text-gold-light" href={`/admin/vehicles/${vehicle.id}`}>Edit vehicle →</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
