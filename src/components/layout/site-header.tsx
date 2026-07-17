"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { navigation, siteSettings } from "@/data/site";
import { BrandMark } from "@/components/ui/brand-mark";

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="site-container flex h-18 items-center justify-between gap-6">
        <BrandMark />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navigation.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? "nav-link-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a className="text-xs text-muted hover:text-white" href={siteSettings.phoneHref}>
            {siteSettings.phoneDisplay}
          </a>
          <Link className="button button-primary button-small" href="/financing">
            Apply for financing
          </Link>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-sm border border-border text-white md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span aria-hidden>{isOpen ? "×" : "☰"}</span>
        </button>
      </div>

      {isOpen ? (
        <nav
          id="mobile-navigation"
          className="site-container flex flex-col gap-1 border-t border-border py-4 md:hidden"
          aria-label="Mobile"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-3 text-sm text-muted hover:bg-surface hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
