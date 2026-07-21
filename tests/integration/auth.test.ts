import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createRegentAuth } from "@/lib/auth/factory";

const migrationFiles = [
  "drizzle/0000_condemned_lockheed.sql",
  "drizzle/0001_flashy_xavin.sql",
  "drizzle/0002_greedy_plazm.sql",
] as const;

async function applyMigrations(database: PGlite) {
  for (const filename of migrationFiles) {
    const migration = await readFile(resolve(filename), "utf8");
    for (const statement of migration.split("--> statement-breakpoint")) {
      if (statement.trim()) await database.exec(statement);
    }
  }
}

describe("staff authentication", () => {
  let database: PGlite;

  beforeEach(async () => {
    database = new PGlite();
    await applyMigrations(database);
  });

  afterEach(async () => {
    await database.close();
  });

  it("supports bootstrap and sign-in while disabling later public sign-up", async () => {
    const auth = createRegentAuth({
      database: drizzle(database),
      secret: "test-secret-that-is-long-enough-for-better-auth",
      baseURL: "http://localhost:3000",
      allowSignUp: true,
    });
    const created = await auth.api.signUpEmail({ body: { name: "Test Admin", email: "admin@example.com", password: "a-secure-password-123" } });
    expect(created.user.email).toBe("admin@example.com");
    const signedIn = await auth.api.signInEmail({ body: { email: "admin@example.com", password: "a-secure-password-123" } });
    expect(signedIn.user.id).toBe(created.user.id);
    await expect(auth.api.signInEmail({ body: { email: "admin@example.com", password: "wrong-password-value" } })).rejects.toThrow();

    const lockedAuth = createRegentAuth({
      database: drizzle(database),
      secret: "test-secret-that-is-long-enough-for-better-auth",
      baseURL: "http://localhost:3000",
      allowSignUp: false,
    });
    await expect(lockedAuth.api.signUpEmail({ body: { name: "Another", email: "another@example.com", password: "another-secure-password-123" } })).rejects.toThrow();
  });
});
