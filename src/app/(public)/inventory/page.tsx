import type { Metadata } from "next";
import Link from "next/link";

import { InventoryExplorer } from "@/components/vehicles/inventory-explorer";
import { getVehicles } from "@/lib/vehicles";
import { getSiteSettings } from "@/data/site-settings-repository";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return { title: settings.seo.inventory.title, description: settings.seo.inventory.description };
}

export default async function InventoryPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface py-24 md:py-32">
        <span
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none font-serif text-[12rem] font-bold tracking-widest text-foreground/[0.025] md:text-[18rem]"
          aria-hidden="true"
        >
          INVENTORY
        </span>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <nav className="mb-4 text-[10px] uppercase tracking-widest text-muted">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Inventory</span>
          </nav>
          <p className="eyebrow animate-fade-in-up">
            Inventory
          </p>
          <h1 className="mt-4 font-serif text-5xl font-medium text-foreground md:text-6xl animate-fade-in-up animation-delay-150">
            The Collection
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted animate-fade-in-up animation-delay-300">
            Browse the current Regent Motors collection and refine it by make, style, fuel type or price.
          </p>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-6" data-reveal>
          <InventoryExplorer vehicles={await getVehicles()} />
        </div>
      </section>
    </>
  );
}
