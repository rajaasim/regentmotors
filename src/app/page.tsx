import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { VehicleShowcase } from "@/components/vehicles/vehicle-showcase";
import { getSiteSettings } from "@/data/site-settings-repository";
import { getFeaturedVehicles } from "@/lib/vehicles";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return { title: settings.seo.home.title, description: settings.seo.home.description };
}

export default async function HomePage() {
  const [featuredVehicles, settings] = await Promise.all([getFeaturedVehicles(), getSiteSettings()]);
  const home = settings.home;

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

      <section className="border-b border-white/5 bg-background py-20 sm:py-28">
        <div className="site-container">
          <VehicleShowcase vehicles={featuredVehicles} />
        </div>
      </section>

      <section id="about" className="section-space border-b border-border bg-black scroll-mt-28">
        <div className="site-container">
          <div className="mx-auto max-w-2xl text-center" data-reveal>
            <p className="eyebrow">{home.promiseEyebrow}</p>
            <h2 className="mt-5 font-serif text-4xl font-medium tracking-tight text-white sm:text-5xl">
              {home.promiseHeading}
            </h2>
          </div>

          <div
            className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3"
            data-reveal-stagger
          >
            {home.promises.map((promise, index) => (
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
          <p className="eyebrow">{home.conciergeEyebrow}</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl font-medium tracking-tight text-white sm:text-5xl">
            {home.conciergeHeading}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted">
            {home.conciergeCopy}
          </p>
          <Link className="button button-primary mt-8" href="/financing#car-finder">
            {home.conciergeCtaLabel} <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
