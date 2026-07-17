"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { Vehicle } from "@/types/vehicle";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function VehicleDetailDialog({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle | null;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [downPayment, setDownPayment] = useState(10);
  const [term, setTerm] = useState(60);

  useEffect(() => {
    if (!vehicle) return;

    const previousActive = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previousActive instanceof HTMLElement) {
        previousActive.focus();
      }
    };
  }, [vehicle, onClose]);

  if (!vehicle) return null;

  const financed = vehicle.price * (1 - downPayment / 100);
  const monthly = Math.round((financed * 1.075) / term);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-4 backdrop-blur-sm sm:p-8"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-dialog-title"
        className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full border border-border bg-black/70 text-xl text-white hover:border-gold"
          aria-label="Close vehicle details"
        >
          ×
        </button>

        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-72 bg-black lg:min-h-[430px]">
            <Image
              src={vehicle.images[0].src}
              alt={vehicle.images[0].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="p-7 sm:p-10">
            <p className="eyebrow">
              {vehicle.year} · {vehicle.trim}
            </p>
            <h2 id="vehicle-dialog-title" className="mt-4 text-3xl font-semibold text-white">
              {vehicle.make} {vehicle.model}
            </h2>
            <p className="mt-3 text-3xl font-semibold text-gold">
              {currency.format(vehicle.price)}
            </p>
            {vehicle.vin ? (
              <p className="mt-2 text-xs text-muted">VIN · {vehicle.vin}</p>
            ) : null}

            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-border pt-7">
              <Specification label="Year" value={String(vehicle.year)} />
              <Specification
                label="Mileage"
                value={`${vehicle.mileage.toLocaleString()} ${vehicle.mileageUnit}`}
              />
              <Specification label="Engine" value={vehicle.engine} />
              <Specification label="Fuel" value={vehicle.fuel} />
              <Specification label="Drivetrain" value={vehicle.drivetrain} />
              <Specification label="Transmission" value={vehicle.transmission} />
              <Specification label="Exterior" value={vehicle.exterior} />
              <Specification label="Interior" value={vehicle.interior} />
            </dl>
          </div>
        </div>

        <div className="grid gap-8 border-t border-border p-7 sm:p-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Calculate payments</p>
            <label className="mt-6 block text-xs uppercase tracking-[0.14em] text-muted">
              Down payment · {downPayment}%
              <input
                type="range"
                min="5"
                max="40"
                value={downPayment}
                onChange={(event) => setDownPayment(Number(event.target.value))}
                className="mt-3 w-full accent-gold"
              />
            </label>
            <label className="mt-5 block text-xs uppercase tracking-[0.14em] text-muted">
              Term · {term} months
              <input
                type="range"
                min="24"
                max="84"
                step="12"
                value={term}
                onChange={(event) => setTerm(Number(event.target.value))}
                className="mt-3 w-full accent-gold"
              />
            </label>
            <div className="mt-6 rounded-lg border border-gold/40 bg-gold/5 p-5">
              <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted">
                Estimated monthly
              </p>
              <p className="mt-2 text-3xl font-semibold text-gold">
                {currency.format(monthly)}
                <span className="ml-1 text-xs text-muted">/mo</span>
              </p>
              <p className="mt-2 text-[0.65rem] text-muted">
                Illustrative estimate only. Final terms are subject to approval.
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow">Check availability</p>
            <p className="mt-5 text-sm leading-6 text-muted">
              Ask about availability, arrange a private viewing or request a test drive for this vehicle.
            </p>
            <a className="button button-primary mt-8 w-full" href={`/contact?vehicle=${vehicle.id}`}>
              Request information
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Specification({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.6rem] uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-white">{value}</dd>
    </div>
  );
}
