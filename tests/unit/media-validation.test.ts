import { describe, expect, it } from "vitest";

import {
  MAX_IMAGE_BYTES,
  uploadFinalizationSchema,
  uploadIntentSchema,
} from "@/lib/media-validation";

describe("media validation", () => {
  it("accepts an allow-listed upload intent", () => {
    expect(
      uploadIntentSchema.safeParse({
        vehicleId: "veh-example",
        filename: "vehicle.webp",
        mimeType: "image/webp",
        byteSize: 2_000_000,
      }).success,
    ).toBe(true);
  });

  it("rejects unsupported and oversized uploads", () => {
    expect(
      uploadIntentSchema.safeParse({
        filename: "vehicle.svg",
        mimeType: "image/svg+xml",
        byteSize: MAX_IMAGE_BYTES + 1,
      }).success,
    ).toBe(false);
  });

  it("requires alt text during finalization", () => {
    expect(
      uploadFinalizationSchema.safeParse({
        uploadId: crypto.randomUUID(),
        altText: "",
        sortOrder: 0,
        width: 1200,
        height: 800,
      }).success,
    ).toBe(false);
  });

  it("requires verified dimensions during finalization", () => {
    expect(
      uploadFinalizationSchema.safeParse({
        uploadId: crypto.randomUUID(),
        altText: "Front three-quarter view",
        sortOrder: 0,
        width: 1200,
        height: 800,
      }).success,
    ).toBe(true);
  });
});
