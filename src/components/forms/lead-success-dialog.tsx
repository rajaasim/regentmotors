"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";

type LeadSuccessDialogProps = {
  reference: string;
  onClose: () => void;
};

const focusableSelector = "a[href], button:not([disabled])";

export function LeadSuccessDialog({ reference, onClose }: LeadSuccessDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const previousActive = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    titleRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      );
      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      if (!firstElement || !lastElement) return;

      if (
        event.shiftKey &&
        (document.activeElement === firstElement || document.activeElement === titleRef.current)
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previousActive instanceof HTMLElement) previousActive.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gold/35 bg-surface p-7 text-center shadow-[0_30px_100px_rgba(0,0,0,0.75)] sm:p-10"
        ref={dialogRef}
        role="dialog"
      >
        <div className="pointer-events-none absolute inset-x-12 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(197,164,126,.18),transparent_68%)]" />
        <div className="success-check mx-auto" aria-hidden="true">
          <svg viewBox="0 0 52 52">
            <circle className="success-check-circle" cx="26" cy="26" fill="none" r="24" />
            <path className="success-check-mark" d="M15 27l7 7 15-16" fill="none" />
          </svg>
        </div>
        <p className="eyebrow mt-6">Submission confirmed</p>
        <h2
          className="mt-3 text-3xl font-semibold text-foreground focus:outline-none"
          id={titleId}
          ref={titleRef}
          tabIndex={-1}
        >
          Enquiry Received
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted">
          Thank you. The Regent Motors team has received your enquiry and can use this reference to locate it.
        </p>
        <div className="mx-auto mt-6 w-fit rounded-full border border-gold/40 bg-gold/10 px-4 py-2">
          <span className="text-[0.6rem] uppercase tracking-[0.18em] text-muted">Reference</span>
          <strong className="ml-3 font-mono text-sm tracking-[0.12em] text-gold">{reference}</strong>
        </div>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button className="button button-outline" onClick={onClose} type="button">
            Close
          </button>
          <Link className="button button-primary" href="/inventory">
            Browse vehicles <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
