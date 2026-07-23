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
  const previewImage = vehicle.images[1];

  return (
    <article
      className="premium-card-hover group relative overflow-hidden rounded-xl border border-border bg-surface focus-within:border-gold/70"
      data-cursor-reveal
      data-reveal="fade"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <Image
          src={vehicle.images[0].src}
          alt={vehicle.images[0].alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition duration-700 group-hover:scale-105 ${
            previewImage ? "group-hover:opacity-0" : ""
          }`}
        />
        {previewImage ? (
          <Image
            alt={previewImage.alt}
            className="object-cover opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={previewImage.src}
          />
        ) : null}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-sm border border-gold/50 bg-black/70 px-2 py-1 text-[0.55rem] uppercase tracking-[0.16em] text-gold">
            {vehicle.bodyStyle}
          </span>
          {vehicle.status !== "available" ? (
            <span className="rounded-sm border border-white/25 bg-black/75 px-2 py-1 text-[0.55rem] uppercase tracking-[0.16em] text-white">
              {vehicle.status}
            </span>
          ) : null}
        </div>
        {previewImage ? (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden="true">
            <span className="size-1.5 rounded-full bg-white transition group-hover:bg-white/45" />
            <span className="size-1.5 rounded-full bg-white/45 transition group-hover:bg-gold" />
          </div>
        ) : null}
      </div>

      <div className="p-6 sm:p-7">
        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">
          {vehicle.year} · {vehicle.trim}
        </p>
        <h3 className="mt-3 font-serif text-2xl font-medium text-foreground">
          {vehicle.make} {vehicle.model}
        </h3>

        <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-border py-4 text-xs">
          <div>
            <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-muted">Mileage</dt>
            <dd className="mt-1 text-foreground">{number.format(vehicle.mileage)} {vehicle.mileageUnit}</dd>
          </div>
          <div>
            <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-muted">Fuel</dt>
            <dd className="mt-1 truncate text-foreground">{vehicle.fuel}</dd>
          </div>
          <div className="text-right">
            <dt className="text-[0.55rem] uppercase tracking-[0.14em] text-muted">Transmission</dt>
            <dd className="mt-1 text-foreground">{vehicle.transmission}</dd>
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
            className="vehicle-card-action text-right text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted transition hover:text-gold focus-visible:text-gold"
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
