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
    <article className="group overflow-hidden rounded-xl border border-border bg-surface transition hover:-translate-y-1 hover:border-gold/50">
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <Image
          src={vehicle.images[0].src}
          alt={vehicle.images[0].alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-4 top-4 rounded-sm border border-gold/50 bg-black/70 px-2 py-1 text-[0.55rem] uppercase tracking-[0.16em] text-gold">
          {vehicle.bodyStyle}
        </span>
      </div>

      <div className="p-5">
        <p className="text-[0.58rem] uppercase tracking-[0.2em] text-muted">
          {vehicle.year} · {vehicle.trim}
        </p>
        <h3 className="mt-3 text-base font-semibold text-white">
          {vehicle.make} {vehicle.model}
        </h3>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.65rem] text-muted">Price</p>
            <p className="mt-1 text-xl font-semibold text-gold">
              {currency.format(vehicle.price)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.65rem] text-muted">Mileage</p>
            <p className="mt-1 text-xs text-white">
              {number.format(vehicle.mileage)} {vehicle.mileageUnit}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 w-full border-t border-border pt-4 text-left text-[0.62rem] uppercase tracking-[0.18em] text-muted transition hover:text-gold"
          onClick={() => onSelect(vehicle)}
        >
          View details
        </button>
      </div>
    </article>
  );
}
