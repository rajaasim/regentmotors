"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { VehicleDetailDialog } from "@/components/vehicles/vehicle-detail-dialog";
import { bodyStyles, type BodyStyle, type Vehicle } from "@/types/vehicle";

const PRICE_STEP = 5000;
const fallbackPriceBounds = { min: 0, max: 250000 };
const price = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const sortOptions = ["price-asc", "price-desc", "year-desc"] as const;
type SortOption = (typeof sortOptions)[number];

function isSortOption(value: string): value is SortOption {
  return sortOptions.some((option) => option === value);
}

function isBodyStyle(value: string): value is BodyStyle {
  return bodyStyles.some((style) => style === value);
}

export function InventoryExplorer({ vehicles }: { vehicles: Vehicle[] }) {
  const priceBounds = useMemo(() => {
    if (vehicles.length === 0) return fallbackPriceBounds;

    const prices = vehicles.map((vehicle) => vehicle.price);
    return {
      min: Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP,
      max: Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP,
    };
  }, [vehicles]);
  const [make, setMake] = useState("all");
  const [bodyStyle, setBodyStyle] = useState<BodyStyle | "all">("all");
  const [fuel, setFuel] = useState("all");
  const [minPrice, setMinPrice] = useState(priceBounds.min);
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
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
        vehicle.price >= minPrice &&
        vehicle.price <= maxPrice &&
        matchesQuery
      );
    });
  }, [bodyStyle, fuel, make, maxPrice, minPrice, query, vehicles]);

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
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
    setQuery("");
  }

  const activeFilters = [
    ...(query.trim()
      ? [{ id: "query", label: `Search: ${query.trim()}`, clear: () => setQuery("") }]
      : []),
    ...(make !== "all"
      ? [{ id: "make", label: make, clear: () => setMake("all") }]
      : []),
    ...(bodyStyle !== "all"
      ? [{ id: "body-style", label: bodyStyle, clear: () => setBodyStyle("all") }]
      : []),
    ...(fuel !== "all"
      ? [{ id: "fuel", label: fuel, clear: () => setFuel("all") }]
      : []),
    ...(minPrice > priceBounds.min
      ? [{ id: "min-price", label: `From ${price.format(minPrice)}`, clear: () => setMinPrice(priceBounds.min) }]
      : []),
    ...(maxPrice < priceBounds.max
      ? [{ id: "max-price", label: `Up to ${price.format(maxPrice)}`, clear: () => setMaxPrice(priceBounds.max) }]
      : []),
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr] lg:gap-12">
        <aside
          ref={filtersRef}
          className="self-start rounded-xl border border-border bg-surface p-6 lg:sticky lg:top-28 lg:p-7"
          aria-labelledby="inventory-filter-title"
          data-cursor-reveal
          data-reveal="fade"
        >
          <h2 id="inventory-filter-title" className="font-serif text-2xl font-medium text-foreground">
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
                <option key={item} value={item}>{item}</option>
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
                <option key={style} value={style}>{style[0].toUpperCase() + style.slice(1)}</option>
              ))}
            </FilterSelect>

            <FilterSelect id="inventory-fuel" label="Fuel" value={fuel} onChange={setFuel}>
              <option value="all">All fuel types</option>
              {fuels.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </FilterSelect>

            <DualPriceRange
              min={priceBounds.min}
              max={priceBounds.max}
              minValue={minPrice}
              maxValue={maxPrice}
              onMinChange={(value) => setMinPrice(Math.min(value, maxPrice - PRICE_STEP))}
              onMaxChange={(value) => setMaxPrice(Math.max(value, minPrice + PRICE_STEP))}
            />
          </div>

          <button
            type="button"
            className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-muted transition hover:text-gold"
            onClick={resetFilters}
          >
            Reset all filters
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

          {activeFilters.length > 0 ? (
            <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Active inventory filters">
              {activeFilters.map((filter) => (
                <button
                  aria-label={`Remove ${filter.label} filter`}
                  className="rounded-full border border-gold/35 bg-gold/8 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-gold transition hover:border-gold hover:bg-gold/15"
                  key={filter.id}
                  onClick={filter.clear}
                  type="button"
                >
                  {filter.label} <span aria-hidden="true">×</span>
                </button>
              ))}
              <button
                className="px-2 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted transition hover:text-foreground"
                onClick={resetFilters}
                type="button"
              >
                Reset all
              </button>
            </div>
          ) : null}

          {displayedVehicles.length > 0 ? (
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3" data-reveal-stagger>
              {displayedVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={setSelectedVehicle} />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-xl border border-dashed border-gold/25 bg-[radial-gradient(circle_at_top,rgba(197,164,126,.08),transparent_55%)] px-6 py-16 text-center">
              <EmptyVehicleGraphic />
              <p className="mt-6 font-serif text-2xl text-foreground">No vehicles match your selection.</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
                Try a broader price range or reset the filters to return to the complete collection.
              </p>
              <button className="button button-primary mt-7" onClick={resetFilters} type="button">
                Reset all filters
              </button>
            </div>
          )}
        </section>
      </div>

      <VehicleDetailDialog vehicle={selectedVehicle} onClose={closeDialog} />
    </>
  );
}

function DualPriceRange({
  min,
  max,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}) {
  const span = max - min;
  const minPercent = span === 0 ? 0 : ((minValue - min) / span) * 100;
  const maxPercent = span === 0 ? 100 : ((maxValue - min) / span) * 100;

  return (
    <div>
      <p className="form-label">Price range</p>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-foreground">
        <output htmlFor="inventory-min-price">{price.format(minValue)}</output>
        <span className="text-muted" aria-hidden="true">—</span>
        <output htmlFor="inventory-max-price">{price.format(maxValue)}</output>
      </div>
      <div className="relative mt-5 h-6">
        <div className="absolute inset-x-0 top-2.5 h-1 rounded-full bg-border" />
        <div
          className="absolute top-2.5 h-1 rounded-full bg-gold"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <input
          aria-label="Minimum price"
          className="range-input"
          id="inventory-min-price"
          max={max - PRICE_STEP}
          min={min}
          onChange={(event) => onMinChange(Number(event.target.value))}
          step={PRICE_STEP}
          type="range"
          value={minValue}
        />
        <input
          aria-label="Maximum price"
          className="range-input"
          id="inventory-max-price"
          max={max}
          min={min + PRICE_STEP}
          onChange={(event) => onMaxChange(Number(event.target.value))}
          step={PRICE_STEP}
          type="range"
          value={maxValue}
        />
      </div>
    </div>
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
      <span className="relative mt-2 block">
        <select
          id={id}
          className="form-control appearance-none pr-10 capitalize"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gold"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path d="m6 8 4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      </span>
    </label>
  );
}

function EmptyVehicleGraphic() {
  return (
    <svg
      aria-hidden="true"
      className="mx-auto h-20 w-40 text-gold/70"
      fill="none"
      viewBox="0 0 180 88"
    >
      <path d="M22 55h136l-8-18c-2-5-7-8-12-9L96 21H65c-7 0-12 3-16 9L35 50l-13 5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M52 28h43l31 7H47l5-7Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="60" r="12" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="135" cy="60" r="12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 67h25m119 0h20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}
