import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const hasSessionCookie = Boolean(getSessionCookie(request));
  const isLogin = request.nextUrl.pathname === "/admin/login";

  if (!hasSessionCookie && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (hasSessionCookie && isLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
