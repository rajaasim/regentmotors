import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const migrationFiles = [
  "drizzle/0000_condemned_lockheed.sql",
  "drizzle/0001_flashy_xavin.sql",
  "drizzle/0002_greedy_plazm.sql",
] as const;

async function applyMigrations(database: PGlite) {
  for (const filename of migrationFiles) {
    const migration = await readFile(resolve(filename), "utf8");
    const statements = migration.split("--> statement-breakpoint");

    for (const statement of statements) {
      if (statement.trim()) {
        await database.exec(statement);
      }
    }
  }
}

describe("database migrations", () => {
  let database: PGlite;

  beforeEach(async () => {
    database = new PGlite();
    await applyMigrations(database);
  });

  afterEach(async () => {
    await database.close();
  });

  it("enforces unique slugs and non-negative vehicle values", async () => {
    const insert = `
      insert into vehicles (
        id, slug, publication_status, inventory_status, featured, year,
        make, model, trim, body_style, price, currency, mileage,
        mileage_unit, fuel, engine, drivetrain, transmission, exterior, interior
      ) values (
        'veh-one', 'approved-vehicle', 'draft', 'available', false, 2024,
        'Approved', 'Vehicle', 'Trim', 'sedan', 1000, 'USD', 10,
        'mi', 'Gasoline', 'Engine', 'AWD', 'Automatic', 'Black', 'Black'
      )`;

    await database.exec(insert);
    await expect(
      database.exec(insert.replace("'veh-one'", "'veh-two'")),
    ).rejects.toThrow();
    await expect(
      database.exec(insert.replace("'veh-one'", "'veh-three'").replace("1000", "-1")),
    ).rejects.toThrow();
  });

  it("enforces the settings singleton and image source boundary", async () => {
    await expect(
      database.exec(`
        insert into site_settings (
          id, name, short_name, logo_url, phone_display, phone_href,
          hours, social_links, description, home, financing_introduction,
          contact_introduction, seo
        ) values (
          'second', 'Regent', 'Regent', '/logo.png', '+1', 'tel:+18482221811',
          '[]', '{}', 'Description', '{}', 'Financing', 'Contact', '{}'
        )`),
    ).rejects.toThrow();
  });
});
