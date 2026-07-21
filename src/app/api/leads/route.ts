import { createLead } from "@/data/leads";
import { DatabaseUnavailableError } from "@/db";
import { leadSubmissionSchema } from "@/lib/lead-validation";
import {
  TurnstileUnavailableError,
  verifyTurnstile,
} from "@/lib/turnstile";
import { hasTrustedMutationOrigin } from "@/lib/security/request-origin";
import { getSiteSettings } from "@/data/site-settings-repository";

const MAX_BODY_BYTES = 20_000;

export async function POST(request: Request) {
  if (!hasTrustedMutationOrigin(request)) return Response.json({ error: "Untrusted request origin." }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Request is too large." }, { status: 413 });
  }

  let rawSubmission: unknown;

  try {
    rawSubmission = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = leadSubmissionSchema.safeParse(rawSubmission);

  if (!parsed.success) {
    return Response.json(
      {
        error: "Please review the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const remoteIp = forwardedFor?.split(",")[0]?.trim();
    const isHuman = await verifyTurnstile(
      parsed.data.turnstileToken,
      remoteIp,
    );

    if (!isHuman) {
      return Response.json(
        { error: "Verification failed. Please try again." },
        { status: 400 },
      );
    }

    const settings = await getSiteSettings();
    const result = await createLead({
      ...parsed.data.lead,
      consentTextVersion: settings.consentTextVersion ?? "v1-2026-07",
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (
      error instanceof DatabaseUnavailableError ||
      error instanceof TurnstileUnavailableError
    ) {
      return Response.json(
        { error: "Form submission is not configured yet." },
        { status: 503 },
      );
    }

    return Response.json(
      { error: "We could not save your enquiry. Please try again." },
      { status: 500 },
    );
  }
}
