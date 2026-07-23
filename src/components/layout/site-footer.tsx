import Link from "next/link";

import { BrandMark } from "@/components/ui/brand-mark";
import { navigation } from "@/data/site";
import type { SiteSettingsInput } from "@/lib/site-settings-validation";

export function SiteFooter({ settings }: { settings: SiteSettingsInput }) {
  return (
    <footer className="border-t border-border bg-background text-foreground">
      <section className="border-b border-border px-6 py-20 text-center sm:py-24" data-reveal>
        <p className="eyebrow">Private consultations</p>
        <h2 className="mx-auto mt-5 max-w-4xl font-serif text-5xl font-medium leading-[1.05] tracking-[-0.025em] sm:text-6xl">
          Ready to Elevate Your Drive?
        </h2>
        <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-7 text-muted sm:text-base">
          {settings.contactIntroduction}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link className="button button-primary" href="/contact?intent=test_drive">
            Book a test drive <span aria-hidden>→</span>
          </Link>
          <a className="button button-outline" href={settings.phoneHref}>
            Call {settings.phoneDisplay}
          </a>
        </div>
      </section>

      <div className="site-container grid gap-12 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <BrandMark name={settings.name} logoUrl={settings.logoUrl} />
          <p className="mt-5 max-w-xs text-sm leading-6 text-muted">
            {settings.description}
          </p>
          <p className="mt-7 text-[0.65rem] uppercase tracking-[0.22em] text-gold">
            Hours
          </p>
          <div className="mt-3 space-y-2 text-xs text-muted">
            {settings.hours.map((hours) => (
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
          <a href={settings.phoneHref} className="footer-link">
            {settings.phoneDisplay}
          </a>
          {settings.email ? <a href={`mailto:${settings.email}`} className="footer-link">{settings.email}</a> : null}
          {settings.addressLine1 || settings.addressLine2 ? <p className="max-w-56 text-xs leading-5 text-muted">{settings.addressLine1}<br />{settings.addressLine2}</p> : null}
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
        <p>© 2026 {settings.name}. All rights reserved.</p>
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
