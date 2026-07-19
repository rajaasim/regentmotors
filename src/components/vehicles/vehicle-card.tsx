import Image from "next/image";

import type { Vehicle } from "@/types/vehicle";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("en-US");

export function VehicleCard({
  vehicle,
  onSelect,
}: {
  vehicle: Vehicle;
  onSelect: (vehicle: Vehicle) => void;
}) {
  return (
    <article
      className="premium-card-hover group overflow-hidden rounded-xl border border-border bg-surface"
      data-cursor-reveal
      data-reveal="fade"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <Image
          src={vehicle.images[0].src}
          alt={vehicle.images[0].alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-sm border border-gold/50 bg-black/70 px-2 py-1 text-[0.55rem] uppercase tracking-[0.16em] text-gold">
          {vehicle.bodyStyle}
        </span>
      </div>

      <div className="p-6 sm:p-7">
        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">
          {vehicle.year} · {vehicle.trim}
        </p>
        <h3 className="mt-3 font-serif text-2xl font-medium text-white">
          {vehicle.make} {vehicle.model}
        </h3>

        <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-border py-4 text-xs">
          <div>
            <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-muted">Mileage</dt>
            <dd className="mt-1 text-white">{number.format(vehicle.mileage)} {vehicle.mileageUnit}</dd>
          </div>
          <div>
            <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-muted">Fuel</dt>
            <dd className="mt-1 truncate text-white">{vehicle.fuel}</dd>
          </div>
          <div className="text-right">
            <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-muted">Transmission</dt>
            <dd className="mt-1 text-white">{vehicle.transmission}</dd>
          </div>
        </dl>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.16em] text-muted">Price</p>
            <p className="mt-1 font-serif text-2xl font-medium text-gold">
              {currency.format(vehicle.price)}
            </p>
          </div>
          <button
            type="button"
            className="text-right text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted transition hover:text-gold"
            aria-label={`View details for ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            onClick={() => onSelect(vehicle)}
          >
            View details <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </article>
  );
}
