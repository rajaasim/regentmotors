import Link from "next/link";

import { LogoutButton } from "@/components/admin/logout-button";
import { requireStaff } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const adminNavigation = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const staff = await requireStaff();

  return (
    <section className="min-h-[75vh] border-t border-border bg-background py-10 sm:py-14">
      <div className="site-container">
        <header className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Regent administration</p>
              <p className="mt-2 text-sm text-muted">
                Signed in as <span className="text-white">{staff.name}</span>
              </p>
            </div>
            <LogoutButton />
          </div>
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Administration">
            {adminNavigation.map((item) => (
              <Link
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-gold/50 hover:text-white"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
