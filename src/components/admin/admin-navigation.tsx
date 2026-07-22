"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavigation = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-wrap gap-2" aria-label="Administration">
      {adminNavigation.map((item) => {
        const isActive = item.href === "/admin"
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
              isActive
                ? "border-gold/60 bg-gold/10 text-white"
                : "border-border text-muted hover:border-gold/50 hover:text-white"
            }`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
