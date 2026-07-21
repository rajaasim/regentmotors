import { z } from "zod";

export const allowedImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export const uploadIntentSchema = z
  .object({
    vehicleId: z.string().trim().min(1).max(80).optional(),
    filename: z.string().trim().min(1).max(255),
    mimeType: z.enum(allowedImageMimeTypes),
    byteSize: z.number().int().positive().max(MAX_IMAGE_BYTES),
  })
  .strict();

export const uploadFinalizationSchema = z
  .object({
    uploadId: z.uuid(),
    altText: z.string().trim().min(1).max(300),
    sortOrder: z.number().int().min(0).max(100),
    width: z.number().int().positive().max(20_000),
    height: z.number().int().positive().max(20_000),
  })
  .strict();

export const mediaEditSchema = z
  .object({
    altText: z.string().trim().min(1).max(300),
    sortOrder: z.number().int().min(0).max(100),
  })
  .strict();

export type UploadIntentInput = z.infer<typeof uploadIntentSchema>;
export type UploadFinalizationInput = z.infer<typeof uploadFinalizationSchema>;
export type MediaEditInput = z.infer<typeof mediaEditSchema>;
