"use client";

import { useRef, useState } from "react";

import { allowedImageMimeTypes, MAX_IMAGE_BYTES } from "@/lib/media-validation";

type UploadIntentResult = { uploadId: string; uploadUrl: string };

function isUploadIntentResult(value: unknown): value is UploadIntentResult {
  return typeof value === "object" && value !== null && "uploadId" in value && typeof value.uploadId === "string" && "uploadUrl" in value && typeof value.uploadUrl === "string";
}

export function SiteImageUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const altTextRef = useRef<HTMLInputElement>(null);

  async function upload() {
    const image = imageRef.current?.files?.[0];
    const altText = altTextRef.current?.value.trim() ?? "";
    if (!image || image.size === 0 || image.size > MAX_IMAGE_BYTES || !allowedImageMimeTypes.some((type) => type === image.type) || !altText) {
      setMessage("Choose an image and enter alternative text.");
      return;
    }
    setIsPending(true);
    try {
      const bitmap = await createImageBitmap(image);
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      const intentResponse = await fetch("/api/admin/media/intent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ filename: image.name, mimeType: image.type, byteSize: image.size }) });
      const intent: unknown = await intentResponse.json();
      if (!intentResponse.ok || !isUploadIntentResult(intent)) throw new Error("intent");
      const uploadResponse = await fetch(intent.uploadUrl, { method: "PUT", headers: { "content-type": image.type }, body: image });
      if (!uploadResponse.ok) throw new Error("upload");
      const finalizeResponse = await fetch("/api/admin/media/finalize", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ uploadId: intent.uploadId, altText, sortOrder: 0, ...dimensions }) });
      const result: unknown = await finalizeResponse.json();
      if (!finalizeResponse.ok || typeof result !== "object" || result === null || !("url" in result) || typeof result.url !== "string") throw new Error("finalize");
      onUploaded(result.url);
      if (imageRef.current) imageRef.current.value = "";
      if (altTextRef.current) altTextRef.current.value = "";
      setMessage("Uploaded. Save settings to keep this URL.");
    } catch {
      setMessage("The image could not be uploaded. Check its type and size, then try again.");
    } finally {
      setIsPending(false);
    }
  }

  return <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="form-label block">Upload image<input ref={imageRef} className="form-control mt-2" type="file" accept="image/jpeg,image/png,image/webp" disabled={isPending} /></label><label className="form-label block">Alternative text<input ref={altTextRef} className="form-control mt-2" maxLength={300} disabled={isPending} /></label><button className="button button-outline button-small" type="button" onClick={upload} disabled={isPending}>{isPending ? "Uploading…" : "Upload"}</button><p className="text-xs text-muted sm:col-span-3" role="status" aria-live="polite">{message}</p></div>;
}
