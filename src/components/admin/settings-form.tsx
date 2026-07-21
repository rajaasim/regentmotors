"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import type { SiteSettingsInput } from "@/lib/site-settings-validation";
import { SiteImageUpload } from "@/components/admin/site-image-upload";

type SettingsFormProps = { settings: SiteSettingsInput };

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl ?? "");
  const [openGraphImageUrl, setOpenGraphImageUrl] = useState(settings.seo.openGraphImageUrl ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsPending(true);

    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const optional = (name: string) => value(name) || undefined;
    const socialLinks = Object.fromEntries(
      ["facebook", "instagram", "youtube", "linkedin"]
        .map((network) => [network, value(`social.${network}`)] as const)
        .filter((entry) => entry[1]),
    );
    const payload = {
      name: value("name"),
      shortName: value("shortName"),
      logoUrl: value("logoUrl"),
      faviconUrl: optional("faviconUrl"),
      phoneDisplay: value("phoneDisplay"),
      phoneHref: value("phoneHref"),
      email: optional("email"),
      addressLine1: optional("addressLine1"),
      addressLine2: optional("addressLine2"),
      hours: value("hours").split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
      mapUrl: optional("mapUrl"),
      socialLinks,
      description: value("description"),
      home: {
        heroEyebrow: value("home.heroEyebrow"),
        heroHeading: value("home.heroHeading"),
        heroCopy: value("home.heroCopy"),
        primaryCtaLabel: value("home.primaryCtaLabel"),
        secondaryCtaLabel: value("home.secondaryCtaLabel"),
        promiseEyebrow: value("home.promiseEyebrow"),
        promiseHeading: value("home.promiseHeading"),
        promises: settings.home.promises.map((_, index) => ({
          title: value(`home.promises.${index}.title`),
          copy: value(`home.promises.${index}.copy`),
        })),
        conciergeEyebrow: value("home.conciergeEyebrow"),
        conciergeHeading: value("home.conciergeHeading"),
        conciergeCopy: value("home.conciergeCopy"),
        conciergeCtaLabel: value("home.conciergeCtaLabel"),
      },
      financingIntroduction: value("financingIntroduction"),
      contactIntroduction: value("contactIntroduction"),
      consentText: optional("consentText"),
      consentTextVersion: optional("consentTextVersion"),
      seo: {
        defaultTitle: value("seo.defaultTitle"),
        defaultDescription: value("seo.defaultDescription"),
        home: { title: value("seo.home.title"), description: value("seo.home.description") },
        inventory: { title: value("seo.inventory.title"), description: value("seo.inventory.description") },
        financing: { title: value("seo.financing.title"), description: value("seo.financing.description") },
        contact: { title: value("seo.contact.title"), description: value("seo.contact.description") },
        openGraphImageUrl: optional("seo.openGraphImageUrl"),
      },
    };

    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    setMessage(response.ok ? "Settings saved." : "Review the settings and try again.");
    setIsPending(false);
    if (response.ok) router.refresh();
  }

  return (
    <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
      <SettingsGroup legend="Business identity" disabled={isPending}>
        <Field label="Business name" name="name" defaultValue={settings.name} />
        <Field label="Short name" name="shortName" defaultValue={settings.shortName} />
        <UrlField label="Logo URL" name="logoUrl" value={logoUrl} onChange={setLogoUrl} />
        <div className="sm:col-span-2"><UrlField label="Favicon URL (optional)" name="faviconUrl" value={faviconUrl} onChange={setFaviconUrl} required={false} /><SiteImageUpload onUploaded={setFaviconUrl} /></div>
        <div className="sm:col-span-2"><SiteImageUpload onUploaded={setLogoUrl} /></div>
        <Area label="Business description" name="description" defaultValue={settings.description} />
      </SettingsGroup>

      <SettingsGroup legend="Contact details" disabled={isPending}>
        <Field label="Phone display" name="phoneDisplay" defaultValue={settings.phoneDisplay} />
        <Field label="Phone link" name="phoneHref" defaultValue={settings.phoneHref} />
        <Field label="Email (optional)" name="email" type="email" defaultValue={settings.email} required={false} />
        <Field label="Address line 1" name="addressLine1" defaultValue={settings.addressLine1} required={false} />
        <Field label="Address line 2" name="addressLine2" defaultValue={settings.addressLine2} required={false} />
        <Field label="Map URL" name="mapUrl" type="url" defaultValue={settings.mapUrl} required={false} />
        <Area label="Hours (one line per row)" name="hours" defaultValue={settings.hours.join("\n")} />
      </SettingsGroup>

      <SettingsGroup legend="Social links" disabled={isPending}>
        {(["facebook", "instagram", "youtube", "linkedin"] as const).map((network) => (
          <Field key={network} label={`${network[0].toUpperCase()}${network.slice(1)} URL`} name={`social.${network}`} type="url" defaultValue={settings.socialLinks[network]} required={false} />
        ))}
      </SettingsGroup>

      <SettingsGroup legend="Home page" disabled={isPending}>
        <Field label="Hero eyebrow" name="home.heroEyebrow" defaultValue={settings.home.heroEyebrow} />
        <Field label="Hero heading" name="home.heroHeading" defaultValue={settings.home.heroHeading} />
        <Area label="Hero copy" name="home.heroCopy" defaultValue={settings.home.heroCopy} />
        <Field label="Primary CTA label" name="home.primaryCtaLabel" defaultValue={settings.home.primaryCtaLabel} />
        <Field label="Secondary CTA label" name="home.secondaryCtaLabel" defaultValue={settings.home.secondaryCtaLabel} />
        <Field label="Promise eyebrow" name="home.promiseEyebrow" defaultValue={settings.home.promiseEyebrow} />
        <Field label="Promise heading" name="home.promiseHeading" defaultValue={settings.home.promiseHeading} />
        {settings.home.promises.map((promise, index) => (
          <div className="grid gap-4 sm:col-span-2" key={`${promise.title}-${index}`}>
            <Field label={`Promise ${index + 1} title`} name={`home.promises.${index}.title`} defaultValue={promise.title} />
            <Area label={`Promise ${index + 1} copy`} name={`home.promises.${index}.copy`} defaultValue={promise.copy} />
          </div>
        ))}
        <Field label="Concierge eyebrow" name="home.conciergeEyebrow" defaultValue={settings.home.conciergeEyebrow} />
        <Field label="Concierge heading" name="home.conciergeHeading" defaultValue={settings.home.conciergeHeading} />
        <Area label="Concierge copy" name="home.conciergeCopy" defaultValue={settings.home.conciergeCopy} />
        <Field label="Concierge CTA label" name="home.conciergeCtaLabel" defaultValue={settings.home.conciergeCtaLabel} />
      </SettingsGroup>

      <SettingsGroup legend="Page copy and consent" disabled={isPending}>
        <Area label="Financing introduction" name="financingIntroduction" defaultValue={settings.financingIntroduction} />
        <Area label="Contact introduction" name="contactIntroduction" defaultValue={settings.contactIntroduction} />
        <Area label="Consent text (optional)" name="consentText" defaultValue={settings.consentText} required={false} />
        <Field label="Consent version (optional)" name="consentTextVersion" defaultValue={settings.consentTextVersion} required={false} />
      </SettingsGroup>

      <SettingsGroup legend="Search and sharing" disabled={isPending}>
        <Field label="Default title" name="seo.defaultTitle" defaultValue={settings.seo.defaultTitle} />
        <Area label="Default description" name="seo.defaultDescription" defaultValue={settings.seo.defaultDescription} />
        {(["home", "inventory", "financing", "contact"] as const).map((page) => (
          <div className="grid gap-4 sm:col-span-2" key={page}>
            <Field label={`${page} title`} name={`seo.${page}.title`} defaultValue={settings.seo[page].title} />
            <Area label={`${page} description`} name={`seo.${page}.description`} defaultValue={settings.seo[page].description} />
          </div>
        ))}
        <div className="sm:col-span-2"><UrlField label="Open Graph image URL" name="seo.openGraphImageUrl" value={openGraphImageUrl} onChange={setOpenGraphImageUrl} type="url" required={false} /><SiteImageUpload onUploaded={setOpenGraphImageUrl} /></div>
      </SettingsGroup>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button className="button button-primary" type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save settings"}</button>
        <p className="text-sm text-muted" role="status" aria-live="polite">{message}</p>
      </div>
    </form>
  );
}

function SettingsGroup({ legend, disabled, children }: { legend: string; disabled: boolean; children: ReactNode }) {
  return <fieldset className="grid gap-5 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2" disabled={disabled}><legend className="px-2 text-sm font-semibold text-white">{legend}</legend>{children}</fieldset>;
}

function Field({ label, name, defaultValue, type = "text", required = true }: { label: string; name: string; defaultValue?: string; type?: "text" | "email" | "url"; required?: boolean }) {
  return <label className="form-label block">{label}<input className="form-control mt-2" name={name} type={type} defaultValue={defaultValue ?? ""} required={required} /></label>;
}

function UrlField({ label, name, value, onChange, type = "text", required = true }: { label: string; name: string; value: string; onChange: (value: string) => void; type?: "text" | "url"; required?: boolean }) {
  return <label className="form-label block">{label}<input className="form-control mt-2" name={name} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} /></label>;
}

function Area({ label, name, defaultValue, required = true }: { label: string; name: string; defaultValue?: string; required?: boolean }) {
  return <label className="form-label block sm:col-span-2">{label}<textarea className="form-control mt-2 min-h-28" name={name} defaultValue={defaultValue ?? ""} required={required} /></label>;
}
