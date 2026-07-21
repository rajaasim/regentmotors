import { z } from "zod";

const requiredText = (maximum: number) => z.string().trim().min(1).max(maximum);
const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((value) => value || undefined)
    .optional();
const optionalUrl = z
  .union([z.url(), z.literal("")])
  .transform((value) => value || undefined)
  .optional();

const pageSeoSchema = z
  .object({
    title: requiredText(80),
    description: requiredText(180),
  })
  .strict();

const promiseItemSchema = z
  .object({
    title: requiredText(100),
    copy: requiredText(400),
  })
  .strict();

export const siteSettingsSchema = z
  .object({
    name: requiredText(120),
    shortName: requiredText(80),
    logoUrl: requiredText(2_000),
    faviconUrl: optionalText(2_000),
    phoneDisplay: requiredText(40),
    phoneHref: z.string().trim().regex(/^tel:\+[1-9]\d{6,14}$/),
    email: z
      .union([z.email().trim().toLowerCase(), z.literal("")])
      .transform((value) => value || undefined)
      .optional(),
    addressLine1: optionalText(180),
    addressLine2: optionalText(180),
    hours: z.array(requiredText(100)).max(14),
    mapUrl: optionalUrl,
    socialLinks: z.record(z.string().trim().min(1).max(40), z.url()).default({}),
    description: requiredText(600),
    home: z
      .object({
        heroEyebrow: requiredText(120),
        heroHeading: requiredText(160),
        heroCopy: requiredText(400),
        primaryCtaLabel: requiredText(80),
        secondaryCtaLabel: requiredText(80),
        promiseEyebrow: requiredText(100),
        promiseHeading: requiredText(160),
        promises: z.array(promiseItemSchema).min(1).max(6),
        conciergeEyebrow: requiredText(100),
        conciergeHeading: requiredText(160),
        conciergeCopy: requiredText(500),
        conciergeCtaLabel: requiredText(80),
      })
      .strict(),
    financingIntroduction: requiredText(800),
    contactIntroduction: requiredText(800),
    consentText: optionalText(1_500),
    consentTextVersion: optionalText(32),
    seo: z
      .object({
        defaultTitle: requiredText(80),
        defaultDescription: requiredText(180),
        home: pageSeoSchema,
        inventory: pageSeoSchema,
        financing: pageSeoSchema,
        contact: pageSeoSchema,
        openGraphImageUrl: optionalUrl,
      })
      .strict(),
  })
  .strict();

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
