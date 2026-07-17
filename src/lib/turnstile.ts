import "server-only";

import { z } from "zod";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export class TurnstileUnavailableError extends Error {
  constructor() {
    super("Turnstile is not configured.");
    this.name = "TurnstileUnavailableError";
  }
}

const turnstileResponseSchema = z.object({
  success: z.boolean(),
  hostname: z.string().optional(),
  "error-codes": z.array(z.string()).optional(),
});

export async function verifyTurnstile(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new TurnstileUnavailableError();
  }

  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch(SITEVERIFY_URL, {
    method: "POST",
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    return false;
  }

  const result = turnstileResponseSchema.safeParse(await response.json());
  return result.success && result.data.success;
}
