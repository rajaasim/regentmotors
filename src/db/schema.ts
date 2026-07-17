import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

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
  ],
);

export type NewLead = typeof leads.$inferInsert;
