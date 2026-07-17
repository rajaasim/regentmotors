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
      <div className="mt-8 flex flex-wrap justify-center gap-2" aria-label="Filter featured vehicles by body style">
        {showcaseBodyStyles.map((style) => (
          <button
            key={style}
            type="button"
            className={`filter-chip ${bodyStyle === style ? "filter-chip-active" : ""}`}
            aria-pressed={bodyStyle === style}
            onClick={() => setBodyStyle(style)}
          >
            {style}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={setSelectedVehicle} />
        ))}
      </div>

      {filteredVehicles.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted">
          No featured vehicles currently match this body style.
        </p>
      ) : null}

      <VehicleDetailDialog vehicle={selectedVehicle} onClose={closeDialog} />
    </>
  );
}
