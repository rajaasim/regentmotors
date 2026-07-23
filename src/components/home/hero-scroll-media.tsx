"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export function HeroScrollMedia() {
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = mediaRef.current;
    const hero = media?.parentElement;
    if (!media || !hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frameId = 0;

    const updatePosition = () => {
      frameId = 0;
      const bounds = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -bounds.top / bounds.height));
      media.style.setProperty("--hero-drive-x", `${progress * -18}vw`);
      media.style.setProperty("--hero-drive-y", `${progress * 1.5}rem`);
      media.style.setProperty("--hero-drive-scale", String(1.04 + progress * 0.04));
    };

    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updatePosition);
    };

    updatePosition();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="hero-car-motion" ref={mediaRef}>
      <Image
        src="/images/hero-car.jpg"
        alt="Premium black vehicle in the Regent Motors showroom"
        fill
        priority
        sizes="112vw"
      />
    </div>
  );
}
