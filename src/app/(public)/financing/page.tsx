import type { Metadata } from "next";

import { LeadForm } from "@/components/forms/lead-form";
import { getSiteSettings } from "@/data/site-settings-repository";
import { getVehicleById } from "@/lib/vehicles";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return { title: settings.seo.financing.title, description: settings.seo.financing.description };
}

type FinancingPageProps = {
  searchParams: Promise<{ vehicle?: string | string[] }>;
};

export default async function FinancingPage({ searchParams }: FinancingPageProps) {
  const query = await searchParams;
  const vehicleId = typeof query.vehicle === "string" ? query.vehicle : "";
  const [settings, vehicle] = await Promise.all([
    getSiteSettings(),
    getVehicleById(vehicleId),
  ]);

  return (
    <>
      <section className="page-hero">
        <div className="site-container" data-reveal>
          <p className="eyebrow">Financing</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Drive It Home, On Your Terms
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            {settings.financingIntroduction}
          </p>
        </div>
      </section>

      <section className="section-space pt-12">
        <div className="site-container grid gap-8 lg:grid-cols-[1.15fr_.85fr]" data-reveal-stagger>
          <LeadForm
            formType="financing"
            title={vehicle
              ? `Discuss financing the ${vehicle.year} ${vehicle.make} ${vehicle.model}`
              : "Start a financing conversation"}
            description={vehicle
              ? `Your enquiry will reference the ${vehicle.year} ${vehicle.make} ${vehicle.model}. Share ordinary contact information only.`
              : "Share ordinary contact information only. A full application will be completed through the dealership's approved financing process."}
            submitLabel="Save financing enquiry"
            vehicleId={vehicle?.id}
            consentText={settings.consentText}
            consentTextVersion={settings.consentTextVersion}
          />

          <div id="car-finder">
            <LeadForm
              formType="car_finder"
              title="Don't see it? We'll find it."
              description="Tell us what you are searching for and the buying team can continue the conversation."
              submitLabel="Start my search"
              includeFinderFields
              consentText={settings.consentText}
              consentTextVersion={settings.consentTextVersion}
            />
          </div>
        </div>
      </section>
    </>
  );
}
