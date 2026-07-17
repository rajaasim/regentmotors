import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
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
      <section className="relative isolate min-h-[700px] overflow-hidden border-b border-border">
        <Image
          src="/images/hero-car.jpg"
          alt="Premium black vehicle in the Regent Motors showroom"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,0,0,.96)_0%,rgba(0,0,0,.74)_42%,rgba(0,0,0,.24)_75%,rgba(0,0,0,.65)_100%)]" />
        <div className="site-container flex min-h-[700px] items-center py-24">
          <div className="max-w-2xl">
            <p className="eyebrow">· Regent Motors ·</p>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-7xl">
              Elevate Your <span className="text-gold">Drive.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/65">
              A meticulously curated collection of premium pre-owned vehicles — backed by transparent history, concierge financing and the Regent standard of quality.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="button button-outline" href="/inventory">
                Explore inventory <span aria-hidden>→</span>
              </Link>
              <Link className="button button-primary" href="/contact">
                Book a test drive
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container">
          <SectionHeading
            eyebrow="Shop by body style"
            title="Find Your Signature Drive"
            align="center"
          />
          <div className="mt-18 flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Featured inventory</p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                Hand-Picked This Week
              </h2>
            </div>
            <Link className="hidden text-xs uppercase tracking-[0.18em] text-muted hover:text-gold sm:block" href="/inventory">
              View full inventory
            </Link>
          </div>
          <VehicleShowcase vehicles={featuredVehicles} />
        </div>
      </section>

      <section className="section-space border-y border-border bg-black">
        <div className="site-container">
          <SectionHeading
            eyebrow="The Regent Promise"
            title="Built On A Foundation Of Excellence"
            align="center"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {promises.map((promise, index) => (
              <article key={promise.title} className="rounded-xl border border-border bg-surface p-7">
                <div className="grid size-10 place-items-center rounded-lg border border-gold/40 text-sm text-gold">
                  0{index + 1}
                </div>
                <h3 className="mt-7 text-base font-semibold text-white">{promise.title}</h3>
                <p className="mt-4 text-sm leading-6 text-muted">{promise.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container text-center">
          <p className="eyebrow">Concierge sourcing</p>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
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
