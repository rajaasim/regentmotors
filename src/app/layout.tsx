import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AmbientInteractions } from "@/components/ui/ambient-interactions";
import { getSiteSettings } from "@/data/site-settings-repository";

import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: settings.seo.defaultTitle, template: `%s | ${settings.name}` },
    description: settings.seo.defaultDescription,
    openGraph: {
      type: "website",
      siteName: settings.name,
      ...(settings.seo.openGraphImageUrl ? { images: [settings.seo.openGraphImageUrl] } : {}),
    },
    ...(settings.faviconUrl ? { icons: { icon: settings.faviconUrl } } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <AmbientInteractions />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader name={settings.name} logoUrl={settings.logoUrl} phoneDisplay={settings.phoneDisplay} phoneHref={settings.phoneHref} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}
