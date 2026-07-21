"use client";

import Image from "next/image";
import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import type { VehicleImage } from "@/types/vehicle";
import { allowedImageMimeTypes, MAX_IMAGE_BYTES } from "@/lib/media-validation";

type UploadIntentResult = { uploadId: string; uploadUrl: string };

function isUploadIntentResult(value: unknown): value is UploadIntentResult {
  return typeof value === "object" && value !== null &&
    "uploadId" in value && typeof value.uploadId === "string" &&
    "uploadUrl" in value && typeof value.uploadUrl === "string";
}

export function VehicleImagesManager({ vehicleId, images }: { vehicleId: string; images: VehicleImage[] }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function uploadImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const selected = data.get("image");
    const altText = String(data.get("altText") ?? "").trim();
    if (!(selected instanceof File) || selected.size === 0 || selected.size > MAX_IMAGE_BYTES || !allowedImageMimeTypes.some((type) => type === selected.type) || !altText) {
      setMessage("Choose an image and enter accurate alternative text.");
      return;
    }

    setIsPending(true);
    try {
      const bitmap = await createImageBitmap(selected);
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      const intentResponse = await fetch("/api/admin/media/intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          filename: selected.name,
          mimeType: selected.type,
          byteSize: selected.size,
        }),
      });
      const intent: unknown = await intentResponse.json();
      if (!intentResponse.ok || !isUploadIntentResult(intent)) throw new Error("intent");

      const uploadResponse = await fetch(intent.uploadUrl, {
        method: "PUT",
        headers: { "content-type": selected.type },
        body: selected,
      });
      if (!uploadResponse.ok) throw new Error("upload");

      const finalizeResponse = await fetch("/api/admin/media/finalize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ uploadId: intent.uploadId, altText, sortOrder: images.length, ...dimensions }),
      });
      if (!finalizeResponse.ok) throw new Error("finalize");
      form.reset();
      setMessage("Image uploaded and verified.");
      router.refresh();
    } catch {
      setMessage("The image could not be uploaded. Check its type and size, then try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function updateImage(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);
    const data = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/media/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ altText: String(data.get("altText") ?? "").trim(), sortOrder: Number(data.get("sortOrder")) }),
    });
    setMessage(response.ok ? "Image details saved." : "Image details could not be saved. Ensure its order is unique.");
    setIsPending(false);
    if (response.ok) router.refresh();
  }

  async function removeImage(id: string) {
    if (!window.confirm("Remove this image from the vehicle?")) return;
    setIsPending(true);
    setMessage(null);
    const response = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    setMessage(response.ok ? "Image removed." : "The image could not be removed. Published vehicles must retain an image.");
    setIsPending(false);
    if (response.ok) router.refresh();
  }

  return (
    <section className="mt-10 rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-serif text-2xl text-white">Vehicle images</h2>
      <p className="mt-2 text-sm text-muted">JPG, PNG or WebP, up to 15 MB. Uploads go directly to protected object storage and are verified before use.</p>
      <form className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={uploadImage}>
        <label className="form-label block">Image<input className="form-control mt-2" name="image" type="file" accept="image/jpeg,image/png,image/webp" required disabled={isPending} /></label>
        <label className="form-label block">Alternative text<input className="form-control mt-2" name="altText" required maxLength={300} disabled={isPending} /></label>
        <button className="button button-primary" type="submit" disabled={isPending}>{isPending ? "Working…" : "Upload image"}</button>
      </form>

      {images.length ? (
        <ul className="mt-8 grid gap-5 lg:grid-cols-2">
          {images.map((image, index) => {
            const imageId = image.id;
            return <li className="overflow-hidden rounded-xl border border-border bg-background" key={imageId ?? image.src}>
              <div className="relative aspect-[16/10]"><Image src={image.src} alt={image.alt} fill unoptimized className="object-cover" /></div>
              {imageId ? <form className="grid gap-4 p-4 sm:grid-cols-[1fr_7rem_auto] sm:items-end" onSubmit={(event) => updateImage(event, imageId)}>
                <label className="form-label block">Alternative text<input className="form-control mt-2" name="altText" defaultValue={image.alt} required maxLength={300} disabled={isPending} /></label>
                <label className="form-label block">Order<input className="form-control mt-2" name="sortOrder" type="number" defaultValue={image.sortOrder ?? index} min={0} max={100} required disabled={isPending} /></label>
                <div className="flex gap-2"><button className="button button-outline button-small" type="submit" disabled={isPending}>Save</button><button className="button button-outline button-small" type="button" disabled={isPending} onClick={() => removeImage(imageId)}>Remove</button></div>
              </form> : null}
            </li>
          })}
        </ul>
      ) : <p className="mt-6 text-sm text-muted">No images yet. A verified image is required before publication.</p>}
      <p className="mt-4 text-sm text-muted" role="status" aria-live="polite">{message}</p>
    </section>
  );
}
