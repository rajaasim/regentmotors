import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { and, eq, lt, isNull } from "drizzle-orm";
import { z } from "zod";

import * as schema from "../src/db/schema";
import { createDatabaseConnection } from "../src/db/factory";

const configuration = z.object({
  databaseUrl: z.url().refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://")),
  accountId: z.string().min(1),
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  bucket: z.string().min(1),
}).parse({
  databaseUrl: process.env.DATABASE_URL,
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET_NAME,
});

async function main() {
  const connection = createDatabaseConnection(configuration.databaseUrl, 1);
  try {
    const db = connection.database;
    const r2 = new S3Client({
      region: "auto",
      endpoint: `https://${configuration.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: configuration.accessKeyId, secretAccessKey: configuration.secretAccessKey },
    });
    const expired = await db.select({ id: schema.pendingMediaUploads.id, objectKey: schema.pendingMediaUploads.objectKey }).from(schema.pendingMediaUploads).where(and(lt(schema.pendingMediaUploads.expiresAt, new Date()), isNull(schema.pendingMediaUploads.finalizedAt)));
    let removed = 0;
    for (const upload of expired) {
      await r2.send(new DeleteObjectCommand({ Bucket: configuration.bucket, Key: upload.objectKey }));
      await db.delete(schema.pendingMediaUploads).where(eq(schema.pendingMediaUploads.id, upload.id));
      removed += 1;
    }
    process.stdout.write(`Removed ${removed} expired or deferred R2 upload objects.\n`);
  } finally {
    await connection.client.end();
  }
}

void main().catch(() => {
  process.stderr.write("Media cleanup failed.\n");
  process.exitCode = 1;
});
