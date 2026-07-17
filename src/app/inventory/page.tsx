import type { Metadata } from "next";

import { InventoryExplorer } from "@/components/vehicles/inventory-explorer";
import { getVehicles } from "@/lib/vehicles";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Browse Regent Motors' curated collection of premium pre-owned vehicles.",
};

export default function InventoryPage() {
  return (
    <>
      <section className="page-hero">
        <div className="site-container">
          <p className="eyebrow">Inventory</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            The Collection
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Every vehicle in the Regent collection is hand-selected, fully inspected and ready for delivery.
          </p>
        </div>
      </section>
      <section className="section-space pt-12">
        <div className="site-container">
          <InventoryExplorer vehicles={getVehicles()} />
        </div>
      </section>
    </>
  );
}
