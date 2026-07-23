import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { VehicleShowcase } from "@/components/vehicles/vehicle-showcase";
import { getSiteSettings } from "@/data/site-settings-repository";
import { getFeaturedVehicles } from "@/lib/vehicles";

const trustPoints = [
  {
    title: "Purposefully selected",
    copy: "Chosen for condition, provenance and long-term value.",
  },
  {
    title: "Documented review",
    copy: "Mechanical, cosmetic and vehicle-history considerations.",
  },
  {
    title: "Clear conversations",
    copy: "Straightforward guidance around the vehicle and financing.",
  },
  {
    title: "Private consultations",
    copy: "Personal viewings and test drives arranged around you.",
  },
] as const;

const sourcingSteps = [
  {
    title: "Share the brief",
    copy: "Tell us the make, model, year range and budget you have in mind.",
  },
  {
    title: "Review the match",
    copy: "Our buyers search a private network of dealers and auctions.",
  },
  {
    title: "Plan the next step",
    copy: "Discuss the vehicle, ask questions and arrange a private viewing.",
  },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return { title: settings.seo.home.title, description: settings.seo.home.description };
}

export default async function HomePage() {
  const [featuredVehicles, settings] = await Promise.all([getFeaturedVehicles(), getSiteSettings()]);
  const home = settings.home;
  const buyerFaqs = [
    {
      question: "How do I arrange a test drive?",
      answer:
        "Choose “Book a test drive” and send your preferred contact details. The Regent Motors team will follow up to arrange a suitable time.",
    },
    {
      question: "Can Regent Motors help me find a specific vehicle?",
      answer:
        "Yes. Use the car finder to share the make, model, year range and budget. The team can then search its dealer and auction network for a suitable match.",
    },
    {
      question: "Is the financing form a credit application?",
      answer:
        "No. It begins a financing conversation about the vehicle and your preferred way to move forward; it is not a credit application.",
    },
    {
      question: "How are vehicles reviewed before presentation?",
      answer:
        "The Regent standard considers mechanical and cosmetic condition, documented history and delivery-ready presentation.",
    },
    {
      question: "Can I discuss the vehicle I currently own?",
      answer:
        "Yes. Send a general enquiry with its year, make, model and any details you would like the team to consider alongside your next purchase.",
    },
    {
      question: "Where is the Regent Motors showroom?",
      answer: [settings.addressLine1, settings.addressLine2]
        .filter((line) => Boolean(line))
        .join(", "),
    },
  ].filter((item) => item.answer);

  return (
    <>
      <section
        className="hero-spotlight relative isolate flex min-h-[700px] items-center justify-center overflow-hidden border-b border-border sm:min-h-screen"
        data-cursor-reveal
      >
        <Image
          src="/images/hero-car.jpg"
          alt="Premium black vehicle in the Regent Motors showroom"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="hero-media-overlay absolute inset-0 -z-10" />

        <div className="site-container relative z-10 py-28 text-center sm:py-32">
          <div className="mx-auto max-w-4xl">
            <p className="eyebrow animate-fade-in-up">{home.heroEyebrow}</p>
            <h1 className="mt-6 font-serif text-5xl font-medium leading-none tracking-tight text-white sm:text-7xl md:text-8xl animate-fade-in-up animation-delay-150">
              {home.heroHeading}<span className="text-gold">.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg animate-fade-in-up animation-delay-300">
              {home.heroCopy}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up animation-delay-450">
              <Link className="button button-primary w-full sm:w-auto" href="/inventory">
                {home.primaryCtaLabel} <span aria-hidden>→</span>
              </Link>
              <Link className="button button-outline w-full sm:w-auto" href="/contact?intent=test_drive">
                {home.secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface" aria-label="Why choose Regent Motors">
        <div className="site-container grid sm:grid-cols-2 xl:grid-cols-4">
          {trustPoints.map((point, index) => (
            <article
              key={point.title}
              className="trust-point px-5 py-7"
            >
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gold">
                0{index + 1}
              </p>
              <h2 className="mt-3 font-sans text-sm font-semibold text-foreground">
                {point.title}
              </h2>
              <p className="mt-2 text-xs leading-5 text-muted">{point.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-border bg-background py-20 sm:py-28">
        <div className="site-container">
          <VehicleShowcase vehicles={featuredVehicles} />
        </div>
      </section>

      <section id="about" className="section-space scroll-mt-28 border-b border-border bg-surface">
        <div className="site-container grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start" data-reveal>
            <p className="eyebrow">{home.promiseEyebrow}</p>
            <h2 className="mt-5 max-w-xl font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
              {home.promiseHeading}
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-7 text-muted sm:text-base">
              From the first review to the final conversation, every stage is designed to make the vehicle and the next step easier to understand.
            </p>
            <Link className="button button-outline mt-8" href="/contact">
              Speak with our team
            </Link>
          </div>

          <ol className="border-t border-border" data-reveal-stagger>
            {home.promises.map((promise, index) => (
              <li
                key={promise.title}
                className="grid gap-5 border-b border-border py-8 sm:grid-cols-[4rem_1fr] sm:py-10"
                data-cursor-reveal
                data-reveal
              >
                <div className="grid size-12 place-items-center rounded-full border border-gold/40 text-xs font-bold tracking-[0.12em] text-gold">
                  0{index + 1}
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-medium text-foreground sm:text-3xl">
                    {promise.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{promise.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-space border-b border-border bg-background">
        <div className="site-container">
          <div className="grid overflow-hidden rounded-2xl border border-border bg-surface lg:grid-cols-2" data-reveal>
            <article className="p-8 sm:p-12 lg:border-r lg:border-border">
              <p className="eyebrow">Flexible pathways</p>
              <h2 className="mt-5 max-w-lg font-serif text-4xl font-medium tracking-tight text-foreground">
                Finance your next vehicle.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-muted">
                Start with a clear conversation about the vehicle and the way you would prefer to move forward. This is an enquiry, not a credit application.
              </p>
              <Link className="button button-primary mt-8" href="/financing">
                Explore financing <span aria-hidden>→</span>
              </Link>
            </article>

            <article className="border-t border-border p-8 sm:p-12 lg:border-t-0">
              <p className="eyebrow">Your current vehicle</p>
              <h2 className="mt-5 max-w-lg font-serif text-4xl font-medium tracking-tight text-foreground">
                Bring it into the conversation.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-muted">
                Share its year, make, model and condition so the team can understand how it may fit alongside your next purchase.
              </p>
              <Link className="button button-outline mt-8" href="/contact?intent=trade_in">
                Discuss your vehicle <span aria-hidden>→</span>
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section-space border-b border-border bg-surface">
        <div className="site-container">
          <div className="mx-auto max-w-3xl text-center" data-reveal>
            <p className="eyebrow">{home.conciergeEyebrow}</p>
            <h2 className="mt-5 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
              {home.conciergeHeading}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted">
              {home.conciergeCopy}
            </p>
          </div>

          <ol className="mt-12 grid gap-5 md:grid-cols-3" data-reveal-stagger>
            {sourcingSteps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-xl border border-border bg-background p-7 sm:p-8"
                data-cursor-reveal
                data-reveal
              >
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold">
                  Step 0{index + 1}
                </p>
                <h3 className="mt-5 font-serif text-2xl font-medium text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{step.copy}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 text-center" data-reveal>
            <Link className="button button-primary" href="/financing#car-finder">
              {home.conciergeCtaLabel} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-space bg-background">
        <div className="site-container grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div data-reveal>
            <p className="eyebrow">Buyer questions</p>
            <h2 className="mt-5 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
              The details, before you ask.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-muted">
              A concise guide to test drives, financing, sourcing and your first conversation with Regent Motors.
            </p>
          </div>

          <div className="border-t border-border" data-reveal>
            {buyerFaqs.map((item) => (
              <details key={item.question} className="group border-b border-border">
                <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-5 font-serif text-xl font-medium text-foreground marker:content-none">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="grid size-8 shrink-0 place-items-center rounded-full border border-border font-sans text-lg text-gold transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 pr-12 text-sm leading-7 text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
