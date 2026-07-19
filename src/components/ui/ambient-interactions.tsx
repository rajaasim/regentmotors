"use client";

import { useEffect } from "react";

const revealSelector = "[data-reveal]";
const cursorRevealSelector = "[data-cursor-reveal]";

export function AmbientInteractions() {
  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerPreference = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (motionPreference.matches || !("IntersectionObserver" in window)) {
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8%",
        threshold: 0.08,
      },
    );

    const observeRevealElements = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>(revealSelector).forEach((element) => {
        element.classList.add("is-reveal-ready");
        revealObserver.observe(element);
      });
    };

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          if (node.matches(revealSelector)) {
            node.classList.add("is-reveal-ready");
            revealObserver.observe(node);
          }
          observeRevealElements(node);
        });
      });
    });

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerPreference.matches || !(event.target instanceof Element)) return;

      const surface = event.target.closest<HTMLElement>(cursorRevealSelector);
      if (!surface) return;

      const bounds = surface.getBoundingClientRect();
      surface.style.setProperty("--cursor-x", `${event.clientX - bounds.left}px`);
      surface.style.setProperty("--cursor-y", `${event.clientY - bounds.top}px`);
    };

    const activationFrame = window.requestAnimationFrame(() => {
      observeRevealElements(document);
      mutationObserver.observe(document.body, { childList: true, subtree: true });
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
    });

    return () => {
      window.cancelAnimationFrame(activationFrame);
      revealObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return null;
}
