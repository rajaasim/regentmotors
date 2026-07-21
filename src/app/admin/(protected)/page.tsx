import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

const destinations = [
  {
    href: "/admin/vehicles",
    title: "Manage vehicles",
    copy: "Create drafts, update factual vehicle details, manage availability and publish approved inventory.",
  },
  {
    href: "/admin/settings",
    title: "Manage site settings",
    copy: "Update approved business information, page copy and search-sharing metadata.",
  },
] as const;

export default function AdminPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl font-medium text-white">Administration</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Choose a content area. Every published change is validated and recorded.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {destinations.map((destination) => (
          <Link
            className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-gold/40"
            href={destination.href}
            key={destination.href}
          >
            <h2 className="font-serif text-2xl text-white">{destination.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{destination.copy}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
