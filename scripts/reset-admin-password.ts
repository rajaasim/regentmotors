import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";

import * as schema from "../src/db/schema";
import { createDatabaseConnection } from "../src/db/factory";

const configurationSchema = z.object({
  databaseUrl: z.url().refine(
    (value) =>
      value.startsWith("postgresql://") || value.startsWith("postgres://"),
    "DATABASE_URL must use PostgreSQL.",
  ),
  adminEmail: z.email().trim().toLowerCase(),
  adminPassword: z.string().min(12).max(128),
});

const configuration = configurationSchema.safeParse({
  databaseUrl: process.env.DATABASE_URL,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
});

if (!configuration.success) {
  throw new Error(
    "Password recovery requires valid DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD environment values.",
  );
}
const config = configuration.data;

async function main() {
  const connection = createDatabaseConnection(config.databaseUrl, 1);
  try {
    const db = connection.database;
    const staff = await db.query.user.findFirst({
      columns: { id: true },
      where: eq(schema.user.email, config.adminEmail),
    });
    if (!staff) throw new Error("No administrator exists for the supplied email address.");
    const password = await hashPassword(config.adminPassword);
    await db.update(schema.account).set({ password, updatedAt: new Date() }).where(eq(schema.account.userId, staff.id));
    await db.delete(schema.session).where(eq(schema.session.userId, staff.id));
    process.stdout.write(`Reset credentials and revoked sessions for ${staff.id}.\n`);
  } finally {
    await connection.client.end();
  }
}

void main().catch(() => {
  process.stderr.write("Password reset failed.\n");
  process.exitCode = 1;
});
