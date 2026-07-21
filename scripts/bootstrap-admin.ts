import { z } from "zod";

import { createDatabaseConnection } from "../src/db/factory";
import { createRegentAuth } from "../src/lib/auth/factory";

const configurationSchema = z.object({
  databaseUrl: z.url().refine(
    (value) =>
      value.startsWith("postgresql://") || value.startsWith("postgres://"),
    "DATABASE_URL must use PostgreSQL.",
  ),
  authSecret: z.string().min(32),
  authUrl: z.url(),
  adminName: z.string().trim().min(2).max(120),
  adminEmail: z.email().trim().toLowerCase(),
  adminPassword: z.string().min(12).max(128),
});

const configuration = configurationSchema.safeParse({
  databaseUrl: process.env.DATABASE_URL,
  authSecret: process.env.BETTER_AUTH_SECRET,
  authUrl: process.env.BETTER_AUTH_URL,
  adminName: process.env.ADMIN_NAME,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
});

if (!configuration.success) {
  throw new Error(
    "Admin bootstrap requires valid DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD environment values.",
  );
}
const config = configuration.data;

async function main() {
  const connection = createDatabaseConnection(config.databaseUrl, 1);
  try {
    const auth = createRegentAuth({
      database: connection.database,
      secret: config.authSecret,
      baseURL: config.authUrl,
      allowSignUp: true,
    });
    const result = await auth.api.signUpEmail({
      body: {
        name: config.adminName,
        email: config.adminEmail,
        password: config.adminPassword,
      },
    });
    if (!result.user.id) throw new Error("Admin bootstrap did not create a staff account.");
    process.stdout.write(`Created Regent Motors administrator ${result.user.id}.\n`);
  } finally {
    await connection.client.end();
  }
}

void main().catch(() => {
  process.stderr.write("Admin bootstrap failed.\n");
  process.exitCode = 1;
});
