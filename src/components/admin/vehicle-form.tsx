"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { bodyStyles, inventoryStatuses, staffPublicationStatuses, type Vehicle } from "@/types/vehicle";
import { proposeVehicleSlug } from "@/lib/vehicle-validation";

type VehicleFormProps = { vehicle?: Vehicle };

const textFields = [
  ["make", "Make"], ["model", "Model"], ["trim", "Trim"],
  ["fuel", "Fuel"], ["engine", "Engine"], ["drivetrain", "Drivetrain"],
  ["transmission", "Transmission"], ["exterior", "Exterior"], ["interior", "Interior"],
] as const;

export function VehicleForm({ vehicle }: VehicleFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(null); setIsPending(true);
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const payload = {
      slug: value("slug"), publicationStatus: value("publicationStatus"),
      inventoryStatus: value("inventoryStatus"), featured: data.get("featured") === "on",
      year: Number(value("year")), make: value("make"), model: value("model"), trim: value("trim"),
      bodyStyle: value("bodyStyle"), price: Number(value("price")), currency: value("currency"),
      mileage: Number(value("mileage")), mileageUnit: value("mileageUnit"), fuel: value("fuel"),
      engine: value("engine"), drivetrain: value("drivetrain"), transmission: value("transmission"),
      exterior: value("exterior"), interior: value("interior"), vin: value("vin"),
    };
    const response = await fetch(vehicle ? `/api/admin/vehicles/${vehicle.id}` : "/api/admin/vehicles", {
      method: vehicle ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
    });
    const result: unknown = await response.json();
    if (!response.ok) { setMessage("Review the vehicle fields and try again."); setIsPending(false); return; }
    if (!vehicle && typeof result === "object" && result !== null && "id" in result && typeof result.id === "string") {
      router.replace(`/admin/vehicles/${result.id}`);
    } else { setMessage("Vehicle saved."); router.refresh(); }
    setIsPending(false);
  }

  const initial = (name: keyof Vehicle) => {
    const value = vehicle?.[name]; return typeof value === "string" || typeof value === "number" ? value : "";
  };

  return (
    <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
      <fieldset className="grid gap-5 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3" disabled={isPending}>
        <legend className="px-2 text-sm font-semibold text-white">Identity and status</legend>
        <div><Field label="Slug" name="slug" defaultValue={initial("slug")} /><button className="mt-2 text-xs text-gold hover:text-gold-light" type="button" onClick={(event) => {
          const form = event.currentTarget.form;
          if (!form) return;
          const get = (name: string) => form.elements.namedItem(name);
          const year = get("year"); const make = get("make"); const model = get("model"); const trim = get("trim"); const slug = get("slug");
          if (!(year instanceof HTMLInputElement) || !(make instanceof HTMLInputElement) || !(model instanceof HTMLInputElement) || !(trim instanceof HTMLInputElement) || !(slug instanceof HTMLInputElement)) return;
          slug.value = proposeVehicleSlug({ year: Number(year.value), make: make.value, model: model.value, trim: trim.value });
        }}>Propose from vehicle details</button></div>
        <Field label="Year" name="year" type="number" defaultValue={initial("year")} />
        <Select label="Publication" name="publicationStatus" values={vehicle ? staffPublicationStatuses : ["draft"] as const} defaultValue={vehicle?.publicationStatus === "published" ? "published" : "draft"} />
        <Select label="Inventory status" name="inventoryStatus" values={inventoryStatuses} defaultValue={vehicle?.status ?? "available"} />
        <Select label="Body style" name="bodyStyle" values={bodyStyles} defaultValue={vehicle?.bodyStyle ?? "sedan"} />
        <label className="flex items-center gap-3 self-end pb-3 text-sm text-white"><input name="featured" type="checkbox" defaultChecked={vehicle?.featured ?? false} /> Featured vehicle</label>
      </fieldset>
      <fieldset className="grid gap-5 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3" disabled={isPending}>
        <legend className="px-2 text-sm font-semibold text-white">Vehicle details</legend>
        {textFields.map(([name, label]) => <Field key={name} label={label} name={name} defaultValue={initial(name)} />)}
        <Field label="VIN (optional)" name="vin" defaultValue={initial("vin")} />
      </fieldset>
      <fieldset className="grid gap-5 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-4" disabled={isPending}>
        <legend className="px-2 text-sm font-semibold text-white">Price and mileage</legend>
        <Field label="Price" name="price" type="number" defaultValue={initial("price")} />
        <Field label="Currency" name="currency" defaultValue="USD" />
        <Field label="Mileage" name="mileage" type="number" defaultValue={initial("mileage")} />
        <Select label="Mileage unit" name="mileageUnit" values={["mi", "km"] as const} defaultValue={vehicle?.mileageUnit ?? "mi"} />
      </fieldset>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center"><button className="button button-primary" type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save vehicle"}</button><p className="text-sm text-muted" role="status" aria-live="polite">{message}</p></div>
    </form>
  );
}

function Field({ label, name, defaultValue, type = "text" }: { label: string; name: string; defaultValue: string | number; type?: "text" | "number" }) {
  return <label className="form-label block">{label}<input className="form-control mt-2" name={name} type={type} defaultValue={defaultValue} required={name !== "vin"} min={type === "number" ? 0 : undefined} /></label>;
}

function Select<const T extends readonly string[]>({ label, name, values, defaultValue }: { label: string; name: string; values: T; defaultValue: T[number] }) {
  return <label className="form-label block">{label}<select className="form-control mt-2" name={name} defaultValue={defaultValue}>{values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>;
}
