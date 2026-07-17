"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { VehicleDetailDialog } from "@/components/vehicles/vehicle-detail-dialog";
import { bodyStyles, type Vehicle } from "@/types/vehicle";

const MAX_PRICE = 250000;

export function InventoryExplorer({ vehicles }: { vehicles: Vehicle[] }) {
  const [make, setMake] = useState("all");
  const [bodyStyle, setBodyStyle] = useState("all");
  const [fuel, setFuel] = useState("all");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [query, setQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const filtersRef = useRef<HTMLElement>(null);
  const closeDialog = useCallback(() => setSelectedVehicle(null), []);

  useEffect(() => {
    filtersRef.current?.setAttribute("data-hydrated", "true");
  }, []);

  const makes = useMemo(
    () => [...new Set(vehicles.map((vehicle) => vehicle.make))].sort(),
    [vehicles],
  );
  const fuels = useMemo(
    () => [...new Set(vehicles.map((vehicle) => vehicle.fuel))].sort(),
    [vehicles],
  );

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesQuery = `${vehicle.make} ${vehicle.model} ${vehicle.trim}`
        .toLowerCase()
        .includes(normalizedQuery);

      return (
        (make === "all" || vehicle.make === make) &&
        (bodyStyle === "all" || vehicle.bodyStyle === bodyStyle) &&
        (fuel === "all" || vehicle.fuel === fuel) &&
        vehicle.price <= maxPrice &&
        matchesQuery
      );
    });
  }, [bodyStyle, fuel, make, maxPrice, query, vehicles]);

  return (
    <>
      <section
        ref={filtersRef}
        className="rounded-xl border border-border bg-surface p-5 sm:p-7"
        aria-label="Inventory filters"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <FilterSelect label="Make" value={make} onChange={setMake}>
            <option value="all">All</option>
            {makes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label="Body style" value={bodyStyle} onChange={setBodyStyle}>
            <option value="all">All</option>
            {bodyStyles.map((style) => (
              <option key={style} value={style}>
                {style[0].toUpperCase() + style.slice(1)}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label="Fuel" value={fuel} onChange={setFuel}>
            <option value="all">All</option>
            {fuels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </FilterSelect>

          <label className="form-label">
            Max price · ${maxPrice.toLocaleString()}
            <input
              type="range"
              min="40000"
              max={MAX_PRICE}
              step="5000"
              value={maxPrice}
              className="mt-4 w-full accent-gold"
              onChange={(event) => setMaxPrice(Number(event.target.value))}
            />
          </label>

          <label className="form-label">
            Search
            <input
              type="search"
              className="form-control mt-2"
              placeholder="Model..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
      </section>

      <div className="mt-10 flex items-center justify-between">
        <p className="text-sm text-muted">
          {filteredVehicles.length} vehicle{filteredVehicles.length === 1 ? "" : "s"} available
        </p>
        <button
          type="button"
          className="text-xs uppercase tracking-[0.16em] text-gold"
          onClick={() => {
            setMake("all");
            setBodyStyle("all");
            setFuel("all");
            setMaxPrice(MAX_PRICE);
            setQuery("");
          }}
        >
          Reset filters
        </button>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={setSelectedVehicle} />
        ))}
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-lg text-white">No vehicles match those filters.</p>
          <p className="mt-2 text-sm text-muted">Try increasing the price or clearing a selection.</p>
        </div>
      ) : null}

      <VehicleDetailDialog vehicle={selectedVehicle} onClose={closeDialog} />
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="form-label">
      {label}
      <select
        className="form-control mt-2 capitalize"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
