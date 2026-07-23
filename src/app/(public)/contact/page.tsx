import type { Metadata } from "next";

import { LeadForm } from "@/components/forms/lead-form";
import { getSiteSettings } from "@/data/site-settings-repository";
import { getVehicleById } from "@/lib/vehicles";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return { title: settings.seo.contact.title, description: settings.seo.contact.description };
}

type ContactPageProps = {
  searchParams: Promise<{
    intent?: string | string[];
    vehicle?: string | string[];
  }>;
};

function firstSearchValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const query = await searchParams;
  const [vehicle, settings] = await Promise.all([
    getVehicleById(firstSearchValue(query.vehicle) ?? ""),
    getSiteSettings(),
  ]);
  const isTestDrive = firstSearchValue(query.intent) === "test_drive";
  const isCurrentVehicleConversation = firstSearchValue(query.intent) === "trade_in";
  const formType = vehicle
    ? isTestDrive
      ? "test_drive"
      : "availability"
    : isTestDrive
      ? "test_drive"
      : "contact";
  const formTitle = vehicle
    ? `Enquire about the ${vehicle.year} ${vehicle.make} ${vehicle.model}`
    : isTestDrive
      ? "Book a test drive"
      : isCurrentVehicleConversation
        ? "Discuss your current vehicle"
      : "How can we help?";
  const formDescription = vehicle
    ? `Your enquiry will include the ${vehicle.year} ${vehicle.make} ${vehicle.model}.`
    : isTestDrive
      ? "Tell us how to reach you and we will arrange a suitable time."
      : isCurrentVehicleConversation
        ? "Share its year, make, model and condition so we can include it in the conversation about your next purchase."
      : undefined;
  return (
    <>
      <section className="page-hero">
        <div className="site-container" data-reveal>
          <p className="eyebrow">Call · Write</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Get in Touch
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            {settings.contactIntroduction}
          </p>
        </div>
      </section>

      <section className="section-space pt-12">
        <div className="site-container grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div className="space-y-6">
            <section
              className="rounded-xl border border-border bg-surface p-7"
              data-cursor-reveal
              data-reveal="fade"
            >
              <p className="eyebrow">{settings.name}</p>
              <dl className="mt-7 space-y-6">
                <ContactItem label="Direct line" value={settings.phoneDisplay} href={settings.phoneHref} />
                {settings.email ? <ContactItem label="Email" value={settings.email} href={`mailto:${settings.email}`} /> : null}
                <ContactItem label="Hours" value={settings.hours.join("\n")} />
              </dl>
            </section>
          </div>

          <LeadForm
            formType={formType}
            title={formTitle}
            description={formDescription}
            submitLabel="Save message"
            includeSubject
            vehicleId={vehicle?.id}
            consentText={settings.consentText}
            consentTextVersion={settings.consentTextVersion}
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
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">{label}</dt>
      <dd className="mt-2">{href ? <a className="hover:text-foreground" href={href}>{content}</a> : content}</dd>
    </div>
  );
}
