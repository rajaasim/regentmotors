import Image from "next/image";
import Link from "next/link";

import { VehicleShowcase } from "@/components/vehicles/vehicle-showcase";
import { getFeaturedVehicles } from "@/lib/vehicles";

const promises = [
  {
    title: "Value · Integrity · Performance",
    copy: "Every vehicle is selected for provenance, condition and long-term value — no compromises and no surprises.",
  },
  {
    title: "Stress-Free Financing",
    copy: "A clear first conversation with transparent expectations and a pathway tailored to the buyer.",
  },
  {
    title: "Meticulously Inspected",
    copy: "Mechanical and cosmetic review, documented history and delivery-ready presentation.",
  },
];

export default function HomePage() {
  const featuredVehicles = getFeaturedVehicles();

  return (
    <>
      <section
        className="relative isolate flex min-h-[700px] items-center justify-center overflow-hidden border-b border-border sm:min-h-screen"
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/45 to-background/80" />

        <div className="site-container relative z-10 py-28 text-center sm:py-32">
          <div className="mx-auto max-w-4xl">
            <p className="eyebrow animate-fade-in-up">Welcome to REGENT MOTORS LLC</p>
            <h1 className="mt-6 font-serif text-5xl font-medium leading-none tracking-tight text-white sm:text-7xl md:text-8xl animate-fade-in-up animation-delay-150">
              Elevate Your Drive<span className="text-gold">.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg animate-fade-in-up animation-delay-300">
              Curated luxury performance vehicles for those who refuse to compromise.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up animation-delay-450">
              <Link className="button button-primary w-full sm:w-auto" href="/inventory">
                View inventory <span aria-hidden>→</span>
              </Link>
              <Link className="button button-outline w-full sm:w-auto" href="/contact?intent=test_drive">
                Book a test drive
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-background py-20 sm:py-28">
        <div className="site-container">
          <VehicleShowcase vehicles={featuredVehicles} />
        </div>
      </section>

      <section id="about" className="section-space border-b border-border bg-black scroll-mt-28">
        <div className="site-container">
          <div className="mx-auto max-w-2xl text-center" data-reveal>
            <p className="eyebrow">The Regent Promise</p>
            <h2 className="mt-5 font-serif text-4xl font-medium tracking-tight text-white sm:text-5xl">
              Built On A Foundation Of Excellence
            </h2>
          </div>

          <div
            className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3"
            data-reveal-stagger
          >
            {promises.map((promise, index) => (
              <article
                key={promise.title}
                className="bg-background p-8 transition-colors hover:bg-surface sm:p-10"
                data-cursor-reveal
                data-reveal
              >
                <div className="grid size-10 place-items-center rounded-lg border border-gold/40 text-sm text-gold">
                  0{index + 1}
                </div>
                <h3 className="mt-7 font-serif text-2xl font-medium text-white">{promise.title}</h3>
                <p className="mt-4 text-sm leading-6 text-muted">{promise.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-background">
        <div className="site-container text-center" data-reveal>
          <p className="eyebrow">Concierge sourcing</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl font-medium tracking-tight text-white sm:text-5xl">
            Can&apos;t find the one? <span className="text-gold">We&apos;ll source it.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted">
            Tell us the make, model and budget. Our buyers use a private network of dealers and auctions to find the right match.
          </p>
          <Link className="button button-primary mt-8" href="/financing#car-finder">
            Start car finder <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
