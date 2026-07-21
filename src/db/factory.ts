import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export function createDatabaseConnection(connectionString: string, maximumConnections = 5) {
  const client = postgres(connectionString, {
    max: maximumConnections,
    prepare: false,
  });

  return {
    client,
    database: drizzle(client, { schema }),
  };
}

export function createDatabase(connectionString: string) {
  return createDatabaseConnection(connectionString).database;
}
