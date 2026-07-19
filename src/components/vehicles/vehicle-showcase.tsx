"use client";

import { useCallback, useMemo, useState } from "react";

import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { VehicleDetailDialog } from "@/components/vehicles/vehicle-detail-dialog";
import { bodyStyles, type BodyStyle, type Vehicle } from "@/types/vehicle";

const showcaseBodyStyles: Array<BodyStyle | "all"> = ["all", ...bodyStyles];

export function VehicleShowcase({ vehicles }: { vehicles: Vehicle[] }) {
  const [bodyStyle, setBodyStyle] = useState<BodyStyle | "all">("all");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const closeDialog = useCallback(() => setSelectedVehicle(null), []);

  const filteredVehicles = useMemo(
    () =>
      bodyStyle === "all"
        ? vehicles
        : vehicles.filter((vehicle) => vehicle.bodyStyle === bodyStyle),
    [bodyStyle, vehicles],
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16" data-reveal>
        <div className="max-w-xl">
          <p className="eyebrow">The Collection</p>
          <h2 className="mt-4 font-serif text-4xl font-medium text-white md:text-5xl">
            Featured Vehicles
          </h2>
          <p className="mt-4 max-w-md text-sm text-muted md:text-base">
            Hand-picked luxury vehicles offering unparalleled performance and prestige.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3" aria-label="Filter featured vehicles by body style">
          {showcaseBodyStyles.map((style) => (
            <button
              key={style}
              type="button"
              className={`rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                bodyStyle === style
                  ? "border-gold bg-gold text-background shadow-[0_4px_15px_rgba(197,164,126,0.35)]"
                  : "border-border text-muted hover:bg-white/5 hover:text-white"
              }`}
              aria-pressed={bodyStyle === style}
              onClick={() => setBodyStyle(style)}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-reveal-stagger>
        {filteredVehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={setSelectedVehicle} />
        ))}
      </div>

      {filteredVehicles.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted">
          No featured vehicles currently match this body style.
        </p>
      ) : null}

      <VehicleDetailDialog vehicle={selectedVehicle} onClose={closeDialog} />
    </>
  );
}
