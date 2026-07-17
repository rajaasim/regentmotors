import Link from "next/link";

import { navigation, siteSettings } from "@/data/site";
import { BrandMark } from "@/components/ui/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-black">
      <div className="site-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <BrandMark />
          <p className="mt-6 max-w-xs text-sm leading-6 text-muted">
            {siteSettings.description}
          </p>
          <p className="mt-6 text-[0.65rem] uppercase tracking-[0.22em] text-gold">
            Hours
          </p>
          {siteSettings.hours.map((hours) => (
            <p key={hours} className="mt-2 text-xs text-muted">
              {hours}
            </p>
          ))}
        </div>

        <FooterColumn title="Quick links">
          {navigation.slice(1).map((item) => (
            <Link key={item.href} href={item.href} className="footer-link">
              {item.label}
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title="Reach us">
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

      </div>

      <div className="site-container flex flex-col gap-3 border-t border-gold/20 py-6 text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Regent Motors. All rights reserved.</p>
        <p className="text-gold">Driven by trust · Backed by quality</p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-4">
      <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-gold">
        {title}
      </h2>
      {children}
    </div>
  );
}
