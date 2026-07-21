import "server-only";

import { eq } from "drizzle-orm";

import { DatabaseUnavailableError, getDatabase } from "@/db";
import { siteSettings } from "@/db/schema";
import { defaultSiteSettings } from "@/data/site-settings-defaults";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/site-settings-validation";

export async function getSiteSettings(): Promise<SiteSettingsInput> {
  let row: SiteSettingsInput | undefined;
  try {
    const rows = await getDatabase()
      .select({
        name: siteSettings.name,
        shortName: siteSettings.shortName,
        logoUrl: siteSettings.logoUrl,
        faviconUrl: siteSettings.faviconUrl,
        phoneDisplay: siteSettings.phoneDisplay,
        phoneHref: siteSettings.phoneHref,
        email: siteSettings.email,
        addressLine1: siteSettings.addressLine1,
        addressLine2: siteSettings.addressLine2,
        hours: siteSettings.hours,
        mapUrl: siteSettings.mapUrl,
        socialLinks: siteSettings.socialLinks,
        description: siteSettings.description,
        home: siteSettings.home,
        financingIntroduction: siteSettings.financingIntroduction,
        contactIntroduction: siteSettings.contactIntroduction,
        consentText: siteSettings.consentText,
        consentTextVersion: siteSettings.consentTextVersion,
        seo: siteSettings.seo,
      })
      .from(siteSettings)
      .where(eq(siteSettings.id, "default"))
      .limit(1);
    const result = rows[0];
    if (result) {
      row = {
        ...result,
        faviconUrl: result.faviconUrl ?? undefined,
        email: result.email ?? undefined,
        addressLine1: result.addressLine1 ?? undefined,
        addressLine2: result.addressLine2 ?? undefined,
        mapUrl: result.mapUrl ?? undefined,
        consentText: result.consentText ?? undefined,
        consentTextVersion: result.consentTextVersion ?? undefined,
      };
    }
  } catch (error) {
    if (!(error instanceof DatabaseUnavailableError)) throw error;
  }

  if (!row) return defaultSiteSettings;
  const parsed = siteSettingsSchema.safeParse(row);
  if (!parsed.success) throw new Error("Stored site settings failed validation.");
  return parsed.data;
}

export async function upsertSiteSettings(input: SiteSettingsInput, actorUserId: string) {
  const parsed = siteSettingsSchema.parse(input);
  await getDatabase().insert(siteSettings).values({
    id: "default",
    ...parsed,
    updatedBy: actorUserId,
    updatedAt: new Date(),
  }).onConflictDoUpdate({ target: siteSettings.id, set: { ...parsed, updatedBy: actorUserId, updatedAt: new Date() } });
}
