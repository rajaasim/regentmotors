"use client";

import { useState } from "react";

import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import type { LeadInput } from "@/lib/lead-validation";

type LeadFormProps = {
  formType: LeadInput["formType"];
  title: string;
  description?: string;
  submitLabel: string;
  includeSubject?: boolean;
  includeFinderFields?: boolean;
  vehicleId?: string;
};

type FormStatus =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; reference: string }
  | { state: "error"; message: string };

export function LeadForm({
  formType,
  title,
  description,
  submitLabel,
  includeSubject = false,
  includeFinderFields = false,
  vehicleId,
}: LeadFormProps) {
  const [status, setStatus] = useState<FormStatus>({ state: "idle" });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ state: "submitting" });

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = includeFinderFields
      ? {
          make: String(data.get("make") ?? ""),
          model: String(data.get("model") ?? ""),
          yearRange: String(data.get("yearRange") ?? ""),
          maxBudget: String(data.get("maxBudget") ?? ""),
          maxMileage: String(data.get("maxMileage") ?? ""),
        }
      : undefined;

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: {
            formType,
            fullName: String(data.get("fullName") ?? ""),
            email: String(data.get("email") ?? ""),
            phone: String(data.get("phone") ?? ""),
            subject: String(data.get("subject") ?? ""),
            message: String(data.get("message") ?? ""),
            vehicleId,
            payload,
            consent: data.get("consent") === "on",
            consentTextVersion: "v1-2026-07",
          },
          turnstileToken,
        }),
      });

      const result: unknown = await response.json();

      if (!isLeadResponse(result) || !response.ok || !result.reference) {
        throw new Error(
          isLeadResponse(result) && result.error
            ? result.error
            : "Unable to save your enquiry.",
        );
      }

      form.reset();
      setTurnstileToken("");
      setTurnstileReset((current) => current + 1);
      setStatus({ state: "success", reference: result.reference });
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save your enquiry.",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-surface p-6 sm:p-8"
      data-cursor-reveal
      data-reveal="fade"
    >
      <p className="eyebrow">Send an enquiry</p>
      <h2 className="mt-4 text-2xl font-semibold text-white">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-6 text-muted">{description}</p> : null}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <TextField label="Full name" name="fullName" required />
        <TextField label="Email" name="email" type="email" />
        <TextField label="Phone" name="phone" type="tel" />
        {includeSubject ? <TextField label="Subject" name="subject" /> : null}

        {includeFinderFields ? (
          <>
            <TextField label="Make" name="make" />
            <TextField label="Model" name="model" />
            <TextField label="Year range" name="yearRange" placeholder="e.g. 2022–2024" />
            <TextField label="Maximum budget" name="maxBudget" placeholder="$" />
            <TextField label="Maximum mileage" name="maxMileage" />
          </>
        ) : null}
      </div>

      <label className="form-label mt-5 block">
        Message
        <textarea
          className="form-control mt-2 min-h-32 resize-y"
          name="message"
          maxLength={3000}
          placeholder="Tell us how we can help..."
        />
      </label>

      <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-muted">
        <input type="checkbox" name="consent" required className="mt-1 accent-gold" />
        <span>I agree that REGENT MOTORS LLC may use these details to respond to this enquiry.</span>
      </label>

      <div className="mt-5">
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          onToken={setTurnstileToken}
          resetSignal={turnstileReset}
        />
      </div>

      <button
        type="submit"
        className="button button-primary mt-6 w-full"
        disabled={
          status.state === "submitting" ||
          !turnstileSiteKey ||
          !turnstileToken
        }
      >
        {status.state === "submitting" ? "Saving enquiry..." : submitLabel}
      </button>

      <div className="mt-4 min-h-6 text-sm" aria-live="polite">
        {status.state === "success" ? (
          <p className="text-emerald-400">Saved successfully. Reference: {status.reference}</p>
        ) : null}
        {status.state === "error" ? <p className="text-red-400">{status.message}</p> : null}
      </div>
    </form>
  );
}

function isLeadResponse(
  value: unknown,
): value is { error?: string; reference?: string } {
  if (typeof value !== "object" || value === null) return false;

  return (
    (!("error" in value) || typeof value.error === "string") &&
    (!("reference" in value) || typeof value.reference === "string")
  );
}

function TextField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="form-label">
      {label}
      <input
        className="form-control mt-2"
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}
