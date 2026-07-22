import type { Metadata } from "next";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
