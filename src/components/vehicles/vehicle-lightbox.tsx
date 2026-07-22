"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

import type { VehicleImage } from "@/types/vehicle";

type VehicleLightboxProps = {
  images: VehicleImage[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

const focusableSelector = "button:not([disabled])";

export function VehicleLightbox({
  images,
  activeIndex,
  onIndexChange,
  onClose,
}: VehicleLightboxProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [zoom, setZoom] = useState(1);
  const activeImage = images[activeIndex] ?? images[0];

  useEffect(() => {
    const previousActive = document.activeElement;
    closeButtonRef.current?.focus();

    return () => {
      if (previousActive instanceof HTMLElement) previousActive.focus();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        onClose();
        return;
      }

      if (event.key === "ArrowRight" && images.length > 1) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setZoom(1);
        onIndexChange((activeIndex + 1) % images.length);
        return;
      }

      if (event.key === "ArrowLeft" && images.length > 1) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setZoom(1);
        onIndexChange((activeIndex - 1 + images.length) % images.length);
        return;
      }

      if (event.key !== "Tab") return;

      const elements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      );
      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        event.stopImmediatePropagation();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        event.stopImmediatePropagation();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [activeIndex, images, onClose, onIndexChange]);

  if (!activeImage) return null;

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-[60] flex flex-col bg-black/96 p-3 backdrop-blur-xl sm:p-6"
      ref={dialogRef}
      role="dialog"
    >
      <div className="flex items-center justify-between gap-4 pb-3 text-white">
        <h2 className="truncate text-sm font-semibold" id={titleId}>Vehicle image gallery</h2>
        <div className="flex items-center gap-2">
          <button
            aria-label="Zoom out"
            className="grid size-10 place-items-center rounded-full border border-white/20 transition hover:border-gold hover:text-gold"
            disabled={zoom <= 1}
            onClick={() => setZoom((current) => Math.max(1, current - 0.5))}
            type="button"
          >
            −
          </button>
          <span className="min-w-12 text-center text-xs text-muted">{Math.round(zoom * 100)}%</span>
          <button
            aria-label="Zoom in"
            className="grid size-10 place-items-center rounded-full border border-white/20 transition hover:border-gold hover:text-gold"
            disabled={zoom >= 2}
            onClick={() => setZoom((current) => Math.min(2, current + 0.5))}
            type="button"
          >
            +
          </button>
          <button
            aria-label="Close image gallery"
            className="ml-2 grid size-10 place-items-center rounded-full border border-white/20 text-xl transition hover:border-gold hover:text-gold"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            ×
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#050505]">
        <Image
          alt={activeImage.alt}
          className="object-contain transition-transform duration-300"
          fill
          sizes="100vw"
          src={activeImage.src}
          style={{ transform: `scale(${zoom})` }}
        />
        {images.length > 1 ? (
          <>
            <button
              aria-label="Previous image"
              className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/65 text-2xl text-white backdrop-blur transition hover:border-gold hover:text-gold"
              onClick={() => {
                setZoom(1);
                onIndexChange((activeIndex - 1 + images.length) % images.length);
              }}
              type="button"
            >
              ‹
            </button>
            <button
              aria-label="Next image"
              className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/65 text-2xl text-white backdrop-blur transition hover:border-gold hover:text-gold"
              onClick={() => {
                setZoom(1);
                onIndexChange((activeIndex + 1) % images.length);
              }}
              type="button"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="scrollbar-luxury mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Gallery thumbnails">
          {images.map((image, index) => (
            <button
              aria-label={`View image ${index + 1}`}
              aria-pressed={activeIndex === index}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border transition ${
                activeIndex === index ? "border-gold" : "border-white/15 hover:border-white/40"
              }`}
              key={image.id ?? `${image.src}-${index}`}
              onClick={() => {
                setZoom(1);
                onIndexChange(index);
              }}
              type="button"
            >
              <Image alt="" className="object-cover" fill sizes="96px" src={image.src} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
