import { describe, expect, it } from "vitest";

import { siteSettingsSchema } from "@/lib/site-settings-validation";

const pageSeo = {
  title: "Regent Motors",
  description: "Approved Regent Motors website content.",
};

const validSettings = {
  name: "REGENT MOTORS LLC",
  shortName: "Regent",
  logoUrl: "/images/logo.png",
  phoneDisplay: "+1 (848) 222-1811",
  phoneHref: "tel:+18482221811",
  hours: [],
  socialLinks: {},
  description: "Approved dealership description.",
  home: {
    heroEyebrow: "Welcome to REGENT MOTORS LLC",
    heroHeading: "Elevate Your Drive.",
    heroCopy: "Curated luxury performance vehicles.",
    primaryCtaLabel: "View inventory",
    secondaryCtaLabel: "Book a test drive",
    promiseEyebrow: "The Regent Promise",
    promiseHeading: "Built On A Foundation Of Excellence",
    promises: [{ title: "Value", copy: "Approved promise copy." }],
    conciergeEyebrow: "Concierge sourcing",
    conciergeHeading: "We will source it.",
    conciergeCopy: "Tell us what you are looking for.",
    conciergeCtaLabel: "Start car finder",
  },
  financingIntroduction: "Start a financing conversation.",
  contactIntroduction: "Schedule a private viewing.",
  seo: {
    defaultTitle: "REGENT MOTORS LLC",
    defaultDescription: "Approved Regent Motors website content.",
    home: pageSeo,
    inventory: pageSeo,
    financing: pageSeo,
    contact: pageSeo,
  },
};

describe("siteSettingsSchema", () => {
  it("accepts strict mapped settings", () => {
    expect(siteSettingsSchema.safeParse(validSettings).success).toBe(true);
  });

  it("rejects secrets or arbitrary settings keys", () => {
    expect(
      siteSettingsSchema.safeParse({
        ...validSettings,
        databaseUrl: "postgresql://example.invalid/database",
      }).success,
    ).toBe(false);
  });
});
