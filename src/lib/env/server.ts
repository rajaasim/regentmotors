import "server-only";

import { z } from "zod";

export class ServerConfigurationError extends Error {
  constructor(service: string) {
    super(`${service} is not configured.`);
    this.name = "ServerConfigurationError";
  }
}

const databaseUrlSchema = z.url().refine(
  (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
  "DATABASE_URL must use PostgreSQL.",
);

const absoluteUrlSchema = z.url();

export function getDatabaseUrl() {
  const parsed = databaseUrlSchema.safeParse(process.env.DATABASE_URL);

  if (!parsed.success) {
    throw new ServerConfigurationError("Database");
  }

  return parsed.data;
}

export function getAuthEnvironment() {
  const parsed = z
    .object({
      secret: z.string().min(32),
      baseURL: absoluteUrlSchema,
    })
    .safeParse({
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL,
    });

  if (!parsed.success) {
    throw new ServerConfigurationError("Staff authentication");
  }

  return parsed.data;
}

export function getR2Environment() {
  const parsed = z
    .object({
      accountId: z.string().min(1),
      accessKeyId: z.string().min(1),
      secretAccessKey: z.string().min(1),
      bucket: z.string().min(1),
      publicBaseUrl: absoluteUrlSchema,
    })
    .safeParse({
      accountId: process.env.R2_ACCOUNT_ID,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      bucket: process.env.R2_BUCKET_NAME,
      publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
    });

  if (!parsed.success) {
    throw new ServerConfigurationError("R2 storage");
  }

  return parsed.data;
}
