/**
 * Next.js Middleware (proxy.ts) — handles authentication & authorization at the edge.
 * Replaces manual token checks scattered across pages/layouts.
 *
 * Rules:
 *  - Unauthenticated users hitting /dashboard/* → redirect to /login
 *  - Authenticated users hitting /login → redirect to /dashboard
 *  - Role-based route protection (e.g., /dashboard/overview → ADMIN only)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

const ADMIN_ONLY_PATHS = [
  "/dashboard/overview",
  "/dashboard/departments",
  "/dashboard/fingerprints",
  "/dashboard/scan-history",
];

const ADMIN_MANAGER_PATHS = ["/dashboard/employees", "/dashboard/leave-ot"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read token from zustand-persisted localStorage via cookie or
  // from a dedicated auth cookie set at login.
  // We read from the "hrm-token" cookie (set explicitly at login by the client).
  const token = request.cookies.get("hrm-token")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isDashboard = pathname.startsWith("/dashboard");

  // ─── Not authenticated → guard dashboard routes ───────────────────────────
  if (isDashboard && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Already authenticated → skip login page ─────────────────────────────
  if (isPublic && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ─── Role-based protection ────────────────────────────────────────────────
  if (token && isDashboard) {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString(),
      );
      const role: string = payload.role;

      if (ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p)) && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard/profile", request.url));
      }

      if (
        ADMIN_MANAGER_PATHS.some((p) => pathname.startsWith(p)) &&
        role !== "ADMIN" &&
        role !== "MANAGER"
      ) {
        return NextResponse.redirect(new URL("/dashboard/profile", request.url));
      }
    } catch {
      // Malformed token → clear and redirect
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("hrm-token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
