export function hasTrustedMutationOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const trustedOrigins = new Set<string>([new URL(request.url).origin]);
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredSiteUrl) {
    try { trustedOrigins.add(new URL(configuredSiteUrl).origin); } catch { return false; }
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const forwardedProtocol = request.headers.get("x-forwarded-proto") ?? "https";
    try { trustedOrigins.add(new URL(`${forwardedProtocol}://${forwardedHost}`).origin); } catch { return false; }
  }

  return trustedOrigins.has(origin);
}
