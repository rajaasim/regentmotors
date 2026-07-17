import type { Metadata } from "next";

import { LeadForm } from "@/components/forms/lead-form";
import { siteSettings } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Regent Motors to arrange a viewing, request a test drive or ask a question.",
};

export default function ContactPage() {
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${siteSettings.addressLine1}, ${siteSettings.addressLine2}`,
  )}`;

  return (
    <>
      <section className="page-hero">
        <div className="site-container">
          <p className="eyebrow">Visit · Call · Write</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Get in Touch
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Schedule a private viewing, book a test drive or simply ask a question.
          </p>
        </div>
      </section>

      <section className="section-space pt-12">
        <div className="site-container grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-surface p-7">
              <p className="eyebrow">Regent Motors</p>
              <dl className="mt-7 space-y-6">
                <ContactItem label="Showroom" value={`${siteSettings.addressLine1}\n${siteSettings.addressLine2}`} />
                <ContactItem label="Direct line" value={siteSettings.phoneDisplay} href={siteSettings.phoneHref} />
                <ContactItem label="Email" value={siteSettings.email} href={`mailto:${siteSettings.email}`} />
                <ContactItem label="Hours" value={siteSettings.hours.join("\n")} />
              </dl>
            </section>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="group grid min-h-72 place-items-center rounded-xl border border-border bg-[radial-gradient(circle_at_30%_30%,rgba(223,171,48,.16),transparent_45%),linear-gradient(135deg,#111,#060606)] text-center transition hover:border-gold/50"
            >
              <span>
                <span className="eyebrow">Showroom location</span>
                <span className="mt-4 block text-xl font-semibold text-white">Get directions</span>
                <span className="mt-2 block text-sm text-muted">Open the showroom in Google Maps →</span>
              </span>
            </a>
          </div>

          <LeadForm
            formType="contact"
            title="How can we help?"
            submitLabel="Save message"
            includeSubject
          />
        </div>
      </section>
    </>
  );
}

function ContactItem({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = <span className="whitespace-pre-line text-sm leading-6 text-muted">{value}</span>;

  return (
    <div>
      <dt className="text-[0.62rem] uppercase tracking-[0.16em] text-gold">{label}</dt>
      <dd className="mt-2">{href ? <a className="hover:text-white" href={href}>{content}</a> : content}</dd>
    </div>
  );
}
