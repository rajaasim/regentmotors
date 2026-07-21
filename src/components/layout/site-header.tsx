"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandMark } from "@/components/ui/brand-mark";
import { navigation } from "@/data/site";

const focusableSelector = "a[href], button:not([disabled])";

export function SiteHeader({ name, logoUrl, phoneDisplay, phoneHref }: { name: string; logoUrl: string; phoneDisplay: string; phoneHref: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const mobileNavigationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirstMobileLink = () => {
      mobileNavigationRef.current
        ?.querySelector<HTMLElement>(focusableSelector)
        ?.focus();
    };
    const frameId = window.requestAnimationFrame(focusFirstMobileLink);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const container = mobileNavigationRef.current;
      if (!container) return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frameId);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen]);

  const closeMobileNavigation = () => setIsOpen(false);

  return (
    <>
      <header className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 rounded-full border border-white/10 bg-background/85 px-5 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:top-6 sm:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          <BrandMark name={name} logoUrl={logoUrl} />

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {navigation.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                    isActive ? "text-white" : "text-muted hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-1/2 h-px -translate-x-1/2 bg-gold transition-all duration-300 group-hover:w-full ${
                      isActive ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-5 md:flex">
            <a className="text-xs text-muted hover:text-white" href={phoneHref}>
              {phoneDisplay}
            </a>
            <Link className="button button-primary button-small" href="/financing">
              Explore financing
            </Link>
          </div>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-white/15 text-white transition hover:bg-white/5 md:hidden"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setIsOpen((current) => !current)}
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden className="flex w-5 flex-col gap-1">
              <span className={`h-0.5 w-full bg-current transition-transform ${isOpen ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`h-0.5 w-full bg-current transition-opacity ${isOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-full bg-current transition-transform ${isOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </header>

      {isOpen ? (
        <div
          id="mobile-navigation"
          ref={mobileNavigationRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-40 flex items-center justify-center bg-background/98 p-6 backdrop-blur-2xl md:hidden"
        >
          <nav className="flex flex-col items-center gap-7 text-center" aria-label="Mobile">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-serif text-3xl font-medium tracking-wide text-white transition-colors hover:text-gold"
                onClick={closeMobileNavigation}
              >
                {item.label}
              </Link>
            ))}
            <a
              className="mt-3 text-sm text-muted hover:text-white"
              href={phoneHref}
              onClick={closeMobileNavigation}
            >
              {phoneDisplay}
            </a>
            <Link
              href="/financing"
              className="button button-primary mt-3"
              onClick={closeMobileNavigation}
            >
              Explore financing
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
