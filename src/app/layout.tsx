import type { Metadata } from "next";

import { getSiteSettings } from "@/data/site-settings-repository";

import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/playfair-display/wght.css";
import "./globals.css";

export const dynamic = "force-dynamic";

const themeBootScript = {
  __html:
    'try{if(window.localStorage.getItem("regent-theme")==="light"){document.documentElement.dataset.theme="light"}}catch{}',
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const hasCustomFavicon =
    settings.faviconUrl && settings.faviconUrl !== "/images/logo.png";

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: settings.seo.defaultTitle, template: `%s | ${settings.name}` },
    description: settings.seo.defaultDescription,
    openGraph: {
      type: "website",
      siteName: settings.name,
      ...(settings.seo.openGraphImageUrl ? { images: [settings.seo.openGraphImageUrl] } : {}),
    },
    ...(hasCustomFavicon ? { icons: { icon: settings.faviconUrl } } : {}),
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
      <head>
        <script dangerouslySetInnerHTML={themeBootScript} />
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
