import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AmbientInteractions } from "@/components/ui/ambient-interactions";
import { getSiteSettings } from "@/data/site-settings-repository";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <AmbientInteractions />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader
        name={settings.name}
        logoUrl={settings.logoUrl}
        phoneDisplay={settings.phoneDisplay}
        phoneHref={settings.phoneHref}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
