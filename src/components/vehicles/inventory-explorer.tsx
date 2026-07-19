"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { VehicleDetailDialog } from "@/components/vehicles/vehicle-detail-dialog";
import { bodyStyles, type BodyStyle, type Vehicle } from "@/types/vehicle";

const MAX_PRICE = 250000;

const sortOptions = ["price-asc", "price-desc", "year-desc"] as const;
type SortOption = (typeof sortOptions)[number];

function isSortOption(value: string): value is SortOption {
  return sortOptions.some((option) => option === value);
}

function isBodyStyle(value: string): value is BodyStyle {
  return bodyStyles.some((style) => style === value);
}

export function InventoryExplorer({ vehicles }: { vehicles: Vehicle[] }) {
  const [make, setMake] = useState("all");
  const [bodyStyle, setBodyStyle] = useState<BodyStyle | "all">("all");
  const [fuel, setFuel] = useState("all");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("price-asc");
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

  const displayedVehicles = useMemo(() => {
    const sorted = [...filteredVehicles];

    switch (sortOption) {
      case "price-desc":
        return sorted.sort((first, second) => second.price - first.price);
      case "year-desc":
        return sorted.sort((first, second) => second.year - first.year);
      case "price-asc":
        return sorted.sort((first, second) => first.price - second.price);
    }
  }, [filteredVehicles, sortOption]);

  function resetFilters() {
    setMake("all");
    setBodyStyle("all");
    setFuel("all");
    setMaxPrice(MAX_PRICE);
    setQuery("");
    setSortOption("price-asc");
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr] lg:gap-12">
        <aside
          ref={filtersRef}
          className="self-start rounded-xl border border-border bg-surface p-6 lg:sticky lg:top-28 lg:p-7"
          aria-labelledby="inventory-filter-title"
        >
          <h2 id="inventory-filter-title" className="font-serif text-2xl font-medium text-white">
            Refine Search
          </h2>

          <div className="mt-7 space-y-5 border-t border-border pt-6">
            <label className="form-label block" htmlFor="inventory-query">
              Search inventory
              <input
                id="inventory-query"
                type="search"
                className="form-control mt-2"
                placeholder="Model or keyword"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <FilterSelect id="inventory-make" label="Make" value={make} onChange={setMake}>
              <option value="all">All makes</option>
              {makes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              id="inventory-body-style"
              label="Body style"
              value={bodyStyle}
              onChange={(value) => {
                if (value === "all" || isBodyStyle(value)) setBodyStyle(value);
              }}
            >
              <option value="all">All body styles</option>
              {bodyStyles.map((style) => (
                <option key={style} value={style}>
                  {style[0].toUpperCase() + style.slice(1)}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect id="inventory-fuel" label="Fuel" value={fuel} onChange={setFuel}>
              <option value="all">All fuel types</option>
              {fuels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </FilterSelect>

            <label className="form-label block" htmlFor="inventory-max-price">
              Maximum price · ${maxPrice.toLocaleString()}
              <input
                id="inventory-max-price"
                type="range"
                min="40000"
                max={MAX_PRICE}
                step="5000"
                value={maxPrice}
                className="mt-4 w-full accent-gold"
                onChange={(event) => setMaxPrice(Number(event.target.value))}
              />
            </label>
          </div>

          <button
            type="button"
            className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-muted transition hover:text-gold"
            onClick={resetFilters}
          >
            Clear filters
          </button>
        </aside>

        <section aria-labelledby="inventory-results-title">
          <div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
            <p id="inventory-results-title" className="text-sm text-muted" aria-live="polite">
              {displayedVehicles.length} vehicle{displayedVehicles.length === 1 ? "" : "s"} available
            </p>
            <FilterSelect
              id="inventory-sort"
              label="Sort inventory"
              value={sortOption}
              compact
              onChange={(value) => {
                if (isSortOption(value)) setSortOption(value);
              }}
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="year-desc">Year: Newest</option>
            </FilterSelect>
          </div>

          {displayedVehicles.length > 0 ? (
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {displayedVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={setSelectedVehicle} />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-xl border border-dashed border-border px-6 py-16 text-center">
              <p className="font-serif text-2xl text-white">No vehicles match your selection.</p>
              <p className="mt-3 text-sm text-muted">
                Try broadening the price, clearing a filter or searching for another model.
              </p>
            </div>
          )}
        </section>
      </div>

      <VehicleDetailDialog vehicle={selectedVehicle} onClose={closeDialog} />
    </>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  compact = false,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`form-label block ${compact ? "sm:w-56" : ""}`} htmlFor={id}>
      <span className={compact ? "sr-only" : ""}>{label}</span>
      <select
        id={id}
        className="form-control mt-2 capitalize"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
