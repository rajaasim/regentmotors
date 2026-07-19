import Link from "next/link";

import { BrandMark } from "@/components/ui/brand-mark";
import { navigation, siteSettings } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background text-white">
      <section className="border-b border-border px-6 py-20 text-center sm:py-24">
        <p className="eyebrow">Private consultations</p>
        <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Ready to Elevate Your Drive?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
          Schedule a private viewing or ask the REGENT MOTORS LLC team about the vehicle that suits you.
        </p>
        <Link className="button button-primary mt-8" href="/contact?intent=test_drive">
          Book a test drive <span aria-hidden>→</span>
        </Link>
      </section>

      <div className="site-container grid gap-12 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <BrandMark />
          <p className="mt-5 max-w-xs text-sm leading-6 text-muted">
            {siteSettings.description}
          </p>
          <p className="mt-7 text-[0.65rem] uppercase tracking-[0.22em] text-gold">
            Hours
          </p>
          <div className="mt-3 space-y-2 text-xs text-muted">
            {siteSettings.hours.map((hours) => (
              <p key={hours}>{hours}</p>
            ))}
          </div>
        </div>

        <FooterColumn title="Explore" className="md:col-span-2">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="footer-link">
              {item.label}
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title="Visit & contact" className="md:col-span-3">
          <a href={siteSettings.phoneHref} className="footer-link">
            {siteSettings.phoneDisplay}
          </a>
          <a href={`mailto:${siteSettings.email}`} className="footer-link">
            {siteSettings.email}
          </a>
          <p className="max-w-56 text-xs leading-5 text-muted">
            {siteSettings.addressLine1}
            <br />
            {siteSettings.addressLine2}
          </p>
        </FooterColumn>

        <FooterColumn title="Enquiries" className="md:col-span-3">
          <Link className="footer-link" href="/contact?intent=test_drive">
            Book a test drive
          </Link>
          <Link className="footer-link" href="/financing">
            Start a financing conversation
          </Link>
          <Link className="footer-link" href="/financing#car-finder">
            Use the car finder
          </Link>
        </FooterColumn>
      </div>

      <div className="site-container flex flex-col gap-3 border-t border-gold/20 py-6 text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 REGENT MOTORS LLC. All rights reserved.</p>
        <p className="text-gold">Driven by trust · Backed by quality</p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  className,
  children,
}: {
  title: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col items-start gap-4 ${className}`}>
      <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-gold">
        {title}
      </h2>
      {children}
    </div>
  );
}
