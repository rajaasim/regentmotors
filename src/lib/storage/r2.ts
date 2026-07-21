import "server-only";

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getR2Environment } from "@/lib/env/server";
import type { UploadIntentInput } from "@/lib/media-validation";

const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

function getClient() {
  const environment = getR2Environment();
  return {
    environment,
    client: new S3Client({
      region: "auto",
      endpoint: `https://${environment.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: environment.accessKeyId,
        secretAccessKey: environment.secretAccessKey,
      },
    }),
  };
}

export function createR2ObjectKey(input: UploadIntentInput) {
  const scope = input.vehicleId ? `vehicles/${input.vehicleId}` : "site";
  return `${scope}/${crypto.randomUUID()}.${extensions[input.mimeType]}`;
}

export async function createR2UploadUrl(input: UploadIntentInput, objectKey: string) {
  const { client, environment } = getClient();
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: environment.bucket,
      Key: objectKey,
      ContentType: input.mimeType,
    }),
    { expiresIn: 300 },
  );
}

export async function inspectR2Object(objectKey: string) {
  const { client, environment } = getClient();
  return client.send(new HeadObjectCommand({ Bucket: environment.bucket, Key: objectKey }));
}

export async function deleteR2Object(objectKey: string) {
  const { client, environment } = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: environment.bucket, Key: objectKey }));
}

export function getR2PublicUrl(objectKey: string) {
  const base = getR2Environment().publicBaseUrl.replace(/\/$/, "");
  return `${base}/${encodeURI(objectKey)}`;
}
