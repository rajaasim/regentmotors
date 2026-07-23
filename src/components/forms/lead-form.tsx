"use client";

import { useCallback, useId, useState } from "react";

import { LeadSuccessDialog } from "@/components/forms/lead-success-dialog";
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
  consentText?: string;
  consentTextVersion?: string;
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
  consentText = "I agree that REGENT MOTORS LLC may use these details to respond to this enquiry.",
  consentTextVersion = "v1-2026-07",
}: LeadFormProps) {
  const [status, setStatus] = useState<FormStatus>({ state: "idle" });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const closeSuccessDialog = useCallback(() => setStatus({ state: "idle" }), []);

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
            consentTextVersion,
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
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-surface p-6 sm:p-8"
        data-cursor-reveal
        data-reveal="fade"
      >
      <p className="eyebrow">Send an enquiry</p>
      <h2 className="mt-4 text-2xl font-semibold text-foreground">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-6 text-muted">{description}</p> : null}

      <div className="mt-7 grid gap-5 sm:grid-cols-2" key={turnstileReset}>
        <TextField label="Full name" name="fullName" required />
        <TextField label="Email" name="email" type="email" />
        <TextField label="Phone" name="phone" type="tel" />
        {includeSubject ? <TextField label="Subject" name="subject" /> : null}

        {includeFinderFields ? (
          <>
            <TextField label="Make" name="make" />
            <TextField label="Model" name="model" />
            <TextField label="Year range" name="yearRange" hint="e.g. 2022–2024" />
            <TextField label="Maximum budget" name="maxBudget" hint="Enter an amount in USD" />
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
        <span>{consentText}</span>
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

      <div className="mt-4 min-h-6 text-sm" aria-live="polite" role="status">
        {status.state === "success" ? (
          <p className="sr-only">Enquiry received. Reference: {status.reference}</p>
        ) : null}
        {status.state === "error" ? <p className="text-red-400">{status.message}</p> : null}
      </div>
      </form>

      {status.state === "success" ? (
        <LeadSuccessDialog
          reference={status.reference}
          onClose={closeSuccessDialog}
        />
      ) : null}
    </>
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
  hint,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  hint?: string;
  required?: boolean;
}) {
  const hintId = useId();
  const errorId = useId();
  const [validationState, setValidationState] = useState<"idle" | "valid" | "invalid">("idle");
  const [isTouched, setIsTouched] = useState(false);
  const supportsFormatValidation = type === "email" || type === "tel";

  function validate(value: string) {
    if (!supportsFormatValidation || value.trim() === "") {
      setValidationState("idle");
      return;
    }

    const isValid = type === "email"
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      : value.replace(/\D/g, "").length >= 7;
    setValidationState(isValid ? "valid" : "invalid");
  }

  const describedBy = validationState === "invalid"
    ? errorId
    : hint
      ? hintId
      : undefined;

  return (
    <label className="floating-field">
      <input
        aria-describedby={describedBy}
        aria-invalid={validationState === "invalid" || undefined}
        className="form-control peer"
        name={name}
        type={type}
        placeholder=" "
        required={required}
        onBlur={(event) => {
          setIsTouched(true);
          validate(event.currentTarget.value);
        }}
        onChange={(event) => {
          if (isTouched) validate(event.currentTarget.value);
        }}
      />
      <span className="floating-label">
        {label}{required ? <span aria-hidden="true"> *</span> : null}
      </span>
      {validationState === "valid" ? (
        <span className="field-validation-icon text-gold" aria-label={`${label} format verified`} role="img">✓</span>
      ) : null}
      {hint && validationState !== "invalid" ? (
        <span className="mt-2 block text-[0.68rem] normal-case tracking-normal text-muted" id={hintId}>{hint}</span>
      ) : null}
      {validationState === "invalid" ? (
        <span className="mt-2 block text-[0.68rem] normal-case tracking-normal text-red-400" id={errorId}>
          Enter a valid {type === "email" ? "email address" : "phone number"}.
        </span>
      ) : null}
    </label>
  );
}
