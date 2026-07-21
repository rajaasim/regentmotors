import type { Metadata } from "next";
import Link from "next/link";

import {
  adminLeadsPageSize,
  listAdminLeads,
} from "@/data/admin-leads";
import { requireStaff } from "@/lib/auth/server";
import { leadFormTypes, type LeadInput } from "@/lib/lead-validation";

export const metadata: Metadata = {
  title: "Lead submissions",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ formType?: string; page?: string }>;
};

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  await requireStaff();
  const query = await searchParams;
  const formType = leadFormTypes.find((value) => value === query.formType);
  const page = query.page && /^[1-9]\d{0,5}$/.test(query.page)
    ? Number(query.page)
    : 1;
  const result = await listAdminLeads({ page, formType });
  const pageCount = Math.max(1, Math.ceil(result.total / adminLeadsPageSize));

  return (
    <main>
      <p className="eyebrow">Customer enquiries</p>
      <h1 className="mt-3 font-serif text-4xl font-medium text-white">
        Leads
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Review form submissions stored in the production database. Customer
        information remains available only to authenticated staff.
      </p>

      <form
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-end"
        method="get"
      >
        <label className="form-label block min-w-64">
          Enquiry type
          <select
            className="form-control mt-2"
            defaultValue={formType ?? "all"}
            name="formType"
          >
            <option value="all">All enquiry types</option>
            {leadFormTypes.map((value) => (
              <option key={value} value={value}>
                {formatLeadType(value)}
              </option>
            ))}
          </select>
        </label>
        <button className="button button-outline" type="submit">
          Filter
        </button>
      </form>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
        {result.items.length === 0 ? (
          <p className="p-6 text-sm text-muted">No submissions found.</p>
        ) : (
          <ul className="divide-y divide-border">
            {result.items.map((lead) => (
              <li className="p-5" key={lead.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-serif text-xl text-white">
                        {lead.fullName}
                      </p>
                      <span className="rounded-full border border-gold/30 px-2.5 py-1 text-xs text-gold-light">
                        {formatLeadType(lead.formType)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {lead.email ?? lead.phone ?? "No contact method"}
                    </p>
                    {lead.vehicleDisplayName ? (
                      <p className="mt-1 text-sm text-muted">
                        {lead.vehicleDisplayName}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted">
                      {lead.reference} · {formatDateTime(lead.createdAt)}
                    </p>
                  </div>
                  <Link
                    className="text-sm text-gold hover:text-gold-light"
                    href={`/admin/leads/${lead.id}`}
                  >
                    View submission →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pageCount > 1 ? (
        <nav
          aria-label="Lead submission pages"
          className="mt-6 flex items-center justify-between gap-4"
        >
          {page > 1 ? (
            <Link
              className="button button-outline"
              href={buildPageHref(page - 1, formType)}
            >
              Previous
            </Link>
          ) : <span />}
          <p className="text-sm text-muted">
            Page {Math.min(page, pageCount)} of {pageCount}
          </p>
          {page < pageCount ? (
            <Link
              className="button button-outline"
              href={buildPageHref(page + 1, formType)}
            >
              Next
            </Link>
          ) : <span />}
        </nav>
      ) : null}
    </main>
  );
}

function buildPageHref(
  page: number,
  formType: LeadInput["formType"] | undefined,
) {
  const query = new URLSearchParams({ page: String(page) });
  if (formType) query.set("formType", formType);
  return `/admin/leads?${query.toString()}`;
}

function formatLeadType(value: LeadInput["formType"]) {
  return value
    .split("_")
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).format(value);
}
