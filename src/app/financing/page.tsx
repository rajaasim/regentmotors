import type { Metadata } from "next";

import { LeadForm } from "@/components/forms/lead-form";

export const metadata: Metadata = {
  title: "Financing",
  description:
    "Start a financing conversation or ask REGENT MOTORS LLC to source your next vehicle.",
};

export default function FinancingPage() {
  return (
    <>
      <section className="page-hero">
        <div className="site-container" data-reveal>
          <p className="eyebrow">Financing</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Drive It Home, On Your Terms
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Start with a clear conversation about the vehicle and the best way to move forward. This v1 form is an enquiry, not a credit application.
          </p>
        </div>
      </section>

      <section className="section-space pt-12">
        <div className="site-container grid gap-8 lg:grid-cols-[1.15fr_.85fr]" data-reveal-stagger>
          <LeadForm
            formType="financing"
            title="Start a financing conversation"
            description="Share ordinary contact information only. A full application will be completed through the dealership's approved financing process."
            submitLabel="Save financing enquiry"
          />

          <div id="car-finder">
            <LeadForm
              formType="car_finder"
              title="Don't see it? We'll find it."
              description="Tell us what you are searching for and the buying team can continue the conversation."
              submitLabel="Start my search"
              includeFinderFields
            />
          </div>
        </div>
      </section>
    </>
  );
}
