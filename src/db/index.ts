import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("Database is not configured.");
    this.name = "DatabaseUnavailableError";
  }
}

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new DatabaseUnavailableError();
  }

  return drizzle(neon(connectionString), { schema });
}
