import "server-only";

import { createDatabase } from "@/db/factory";
import { getDatabaseUrl, ServerConfigurationError } from "@/lib/env/server";

export { createDatabase } from "@/db/factory";

export class DatabaseUnavailableError extends ServerConfigurationError {
  constructor() {
    super("Database");
    this.name = "DatabaseUnavailableError";
  }
}

let database: ReturnType<typeof createDatabase> | undefined;

export function getDatabase() {
  try {
    database ??= createDatabase(getDatabaseUrl());
    return database;
  } catch (error) {
    if (error instanceof ServerConfigurationError) {
      throw new DatabaseUnavailableError();
    }

    throw error;
  }
}
