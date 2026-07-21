import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type {
  HomePageContent,
  SiteSeoSettings,
} from "@/types/site-settings";

export const publicationStatusEnum = pgEnum("publication_status", [
  "draft",
  "published",
  "archived",
]);

export const inventoryStatusEnum = pgEnum("inventory_status", [
  "available",
  "reserved",
  "sold",
]);

export const bodyStyleEnum = pgEnum("body_style", [
  "sedan",
  "suv",
  "coupe",
  "convertible",
  "hatchback",
  "truck",
]);

export const mileageUnitEnum = pgEnum("mileage_unit", ["mi", "km"]);
export const staffRoleEnum = pgEnum("staff_role", ["admin", "editor"]);

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: staffRoleEnum("role").notNull().default("admin"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("user_email_unique").on(table.email)],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("session_token_unique").on(table.token),
    index("session_user_id_idx").on(table.userId),
    index("session_expires_at_idx").on(table.expiresAt),
  ],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    uniqueIndex("account_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: varchar("id", { length: 80 }).primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull(),
    publicationStatus: publicationStatusEnum("publication_status")
      .notNull()
      .default("draft"),
    inventoryStatus: inventoryStatusEnum("inventory_status")
      .notNull()
      .default("available"),
    featured: boolean("featured").notNull().default(false),
    year: integer("year").notNull(),
    make: varchar("make", { length: 80 }).notNull(),
    model: varchar("model", { length: 100 }).notNull(),
    trim: varchar("trim", { length: 120 }).notNull(),
    bodyStyle: bodyStyleEnum("body_style").notNull(),
    price: integer("price").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    mileage: integer("mileage").notNull(),
    mileageUnit: mileageUnitEnum("mileage_unit").notNull().default("mi"),
    fuel: varchar("fuel", { length: 80 }).notNull(),
    engine: varchar("engine", { length: 120 }).notNull(),
    drivetrain: varchar("drivetrain", { length: 80 }).notNull(),
    transmission: varchar("transmission", { length: 100 }).notNull(),
    exterior: varchar("exterior", { length: 120 }).notNull(),
    interior: varchar("interior", { length: 120 }).notNull(),
    vin: varchar("vin", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("vehicles_slug_unique").on(table.slug),
    index("vehicles_public_inventory_idx").on(
      table.publicationStatus,
      table.inventoryStatus,
    ),
    index("vehicles_featured_idx").on(
      table.publicationStatus,
      table.featured,
    ),
    check("vehicles_year_check", sql`${table.year} between 1886 and 2100`),
    check("vehicles_price_check", sql`${table.price} >= 0`),
    check("vehicles_mileage_check", sql`${table.mileage} >= 0`),
  ],
);

export const vehicleImages = pgTable(
  "vehicle_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: varchar("vehicle_id", { length: 80 }).references(
      () => vehicles.id,
      { onDelete: "cascade" },
    ),
    objectKey: text("object_key"),
    sourceUrl: text("source_url"),
    originalFilename: varchar("original_filename", { length: 255 }),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    byteSize: integer("byte_size"),
    width: integer("width"),
    height: integer("height"),
    altText: varchar("alt_text", { length: 300 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("vehicle_images_vehicle_order_unique").on(
      table.vehicleId,
      table.sortOrder,
    ),
    uniqueIndex("vehicle_images_object_key_unique").on(table.objectKey),
    check(
      "vehicle_images_source_check",
      sql`(${table.objectKey} is not null) <> (${table.sourceUrl} is not null)`,
    ),
    check(
      "vehicle_images_byte_size_check",
      sql`${table.byteSize} is null or ${table.byteSize} > 0`,
    ),
  ],
);

export const siteSettings = pgTable(
  "site_settings",
  {
    id: varchar("id", { length: 16 }).primaryKey().default("default"),
    name: varchar("name", { length: 120 }).notNull(),
    shortName: varchar("short_name", { length: 80 }).notNull(),
    logoUrl: text("logo_url").notNull(),
    faviconUrl: text("favicon_url"),
    phoneDisplay: varchar("phone_display", { length: 40 }).notNull(),
    phoneHref: varchar("phone_href", { length: 64 }).notNull(),
    email: varchar("email", { length: 254 }),
    addressLine1: varchar("address_line_1", { length: 180 }),
    addressLine2: varchar("address_line_2", { length: 180 }),
    hours: jsonb("hours").$type<string[]>().notNull(),
    mapUrl: text("map_url"),
    socialLinks: jsonb("social_links")
      .$type<Record<string, string>>()
      .notNull(),
    description: text("description").notNull(),
    home: jsonb("home").$type<HomePageContent>().notNull(),
    financingIntroduction: text("financing_introduction").notNull(),
    contactIntroduction: text("contact_introduction").notNull(),
    consentText: text("consent_text"),
    consentTextVersion: varchar("consent_text_version", { length: 32 }),
    seo: jsonb("seo").$type<SiteSeoSettings>().notNull(),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("site_settings_singleton_check", sql`${table.id} = 'default'`),
  ],
);

export type AuditSummary = Record<
  string,
  string | number | boolean | null
>;

export const adminAuditEvents = pgTable(
  "admin_audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 60 }).notNull(),
    entityId: varchar("entity_id", { length: 160 }).notNull(),
    summary: jsonb("summary").$type<AuditSummary>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("admin_audit_entity_idx").on(table.entityType, table.entityId),
    index("admin_audit_created_at_idx").on(table.createdAt),
  ],
);

export const pendingMediaUploads = pgTable(
  "pending_media_uploads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestedBy: text("requested_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    vehicleId: varchar("vehicle_id", { length: 80 }).references(
      () => vehicles.id,
      { onDelete: "cascade" },
    ),
    objectKey: text("object_key").notNull(),
    expectedMimeType: varchar("expected_mime_type", { length: 100 }).notNull(),
    expectedByteSize: integer("expected_byte_size").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    finalizedAt: timestamp("finalized_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("pending_media_object_key_unique").on(table.objectKey),
    index("pending_media_expiry_idx").on(table.expiresAt, table.finalizedAt),
    check(
      "pending_media_byte_size_check",
      sql`${table.expectedByteSize} > 0`,
    ),
  ],
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: varchar("reference", { length: 32 }).notNull().unique(),
    formType: varchar("form_type", { length: 32 }).notNull(),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }),
    phone: varchar("phone", { length: 40 }),
    subject: varchar("subject", { length: 160 }),
    message: text("message"),
    vehicleId: varchar("vehicle_id", { length: 80 }),
    vehicleDisplayName: varchar("vehicle_display_name", { length: 240 }),
    payload: jsonb("payload").$type<Record<string, string | number | boolean>>(),
    consent: boolean("consent").notNull().default(false),
    consentTextVersion: varchar("consent_text_version", { length: 32 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("leads_created_at_idx").on(table.createdAt),
    index("leads_form_type_idx").on(table.formType),
    index("leads_reference_idx").on(table.reference),
  ],
);

export type NewLead = typeof leads.$inferInsert;
