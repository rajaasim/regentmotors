import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { findAdminLeadById } from "@/data/admin-leads";
import { requireStaff } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Lead submission",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminLeadDetailPage({ params }: PageProps) {
  await requireStaff();
  const { id } = await params;
  const lead = await findAdminLeadById(id);

  if (!lead) notFound();

  const payloadEntries = lead.payload ? Object.entries(lead.payload) : [];

  return (
    <main>
      <Link className="text-sm text-gold hover:text-gold-light" href="/admin/leads">
        ← Back to leads
      </Link>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{formatLeadType(lead.formType)}</p>
          <h1 className="mt-3 font-serif text-4xl font-medium text-white">
            {lead.fullName}
          </h1>
        </div>
        <div className="text-sm text-muted sm:text-right">
          <p>{lead.reference}</p>
          <p className="mt-1">{formatDateTime(lead.createdAt)}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <DetailGroup title="Contact details">
          <Detail label="Full name" value={lead.fullName} />
          <DetailLink label="Email" href={lead.email ? `mailto:${lead.email}` : undefined} value={lead.email} />
          <DetailLink label="Phone" href={lead.phone ? `tel:${lead.phone}` : undefined} value={lead.phone} />
        </DetailGroup>

        <DetailGroup title="Submission context">
          <Detail label="Enquiry type" value={formatLeadType(lead.formType)} />
          <Detail label="Subject" value={lead.subject} />
          <Detail label="Vehicle" value={lead.vehicleDisplayName} />
          <Detail label="Consent recorded" value={lead.consent ? "Yes" : "No"} />
          <Detail label="Consent version" value={lead.consentTextVersion} />
        </DetailGroup>

        <section className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2 sm:p-6">
          <h2 className="font-serif text-2xl text-white">Message</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">
            {lead.message || "No message was provided."}
          </p>
        </section>

        {payloadEntries.length > 0 ? (
          <DetailGroup title="Requested vehicle preferences" wide>
            {payloadEntries.map(([key, value]) => (
              <Detail key={key} label={formatPayloadLabel(key)} value={String(value)} />
            ))}
          </DetailGroup>
        ) : null}
      </div>
    </main>
  );
}

function DetailGroup({
  title,
  wide = false,
  children,
}: {
  title: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-surface p-5 sm:p-6${wide ? " lg:col-span-2" : ""}`}>
      <h2 className="font-serif text-2xl text-white">{title}</h2>
      <dl className="mt-5 grid gap-5 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.16em] text-gold-light">{label}</dt>
      <dd className="mt-2 break-words text-sm text-white">{value || "Not provided"}</dd>
    </div>
  );
}

function DetailLink({
  label,
  href,
  value,
}: {
  label: string;
  href?: string;
  value?: string | null;
}) {
  return href && value ? (
    <div>
      <dt className="text-xs uppercase tracking-[0.16em] text-gold-light">{label}</dt>
      <dd className="mt-2 break-all text-sm">
        <a className="text-white underline decoration-border underline-offset-4 hover:text-gold-light" href={href}>
          {value}
        </a>
      </dd>
    </div>
  ) : <Detail label={label} value={value} />;
}

function formatLeadType(value: string) {
  return value
    .split("_")
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

function formatPayloadLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).format(value);
}
