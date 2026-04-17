import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/entries", "/tags", "/recurring", "/reports", "/goals", "/notifications", "/me", "/help", "/wellbeing"];
const AUTH_ONLY = ["/login", "/register"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasAuth = req.cookies.get("auth");
  const hasRefresh = req.cookies.get("refresh");
  const authenticated = Boolean(hasAuth || hasRefresh);

  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!authenticated) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  if (AUTH_ONLY.some((p) => pathname === p)) {
    if (authenticated) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/entries/:path*", "/tags/:path*", "/recurring/:path*", "/reports/:path*", "/goals/:path*", "/notifications/:path*", "/me/:path*", "/me", "/help/:path*", "/help", "/wellbeing/:path*", "/wellbeing", "/login", "/register"],
};
