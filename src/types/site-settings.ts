export type PromiseItem = {
  title: string;
  copy: string;
};

export type PageSeo = {
  title: string;
  description: string;
};

export type SiteSeoSettings = {
  defaultTitle: string;
  defaultDescription: string;
  home: PageSeo;
  inventory: PageSeo;
  financing: PageSeo;
  contact: PageSeo;
  openGraphImageUrl?: string;
};

export type HomePageContent = {
  heroEyebrow: string;
  heroHeading: string;
  heroCopy: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  promiseEyebrow: string;
  promiseHeading: string;
  promises: PromiseItem[];
  conciergeEyebrow: string;
  conciergeHeading: string;
  conciergeCopy: string;
  conciergeCtaLabel: string;
};

export type SiteSettings = {
  name: string;
  shortName: string;
  logoUrl: string;
  faviconUrl?: string;
  phoneDisplay: string;
  phoneHref: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  hours: string[];
  mapUrl?: string;
  socialLinks: Record<string, string>;
  description: string;
  home: HomePageContent;
  financingIntroduction: string;
  contactIntroduction: string;
  consentText?: string;
  consentTextVersion?: string;
  seo: SiteSeoSettings;
};
