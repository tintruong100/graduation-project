/**
 * Next.js Middleware (proxy.ts) — handles authentication & authorization at the edge.
 * Replaces manual token checks scattered across pages/layouts.
 *
 * Rules:
 *  - Unauthenticated users hitting /dashboard/* → redirect to /login
 *  - Authenticated users hitting /login → redirect to role-based landing page
 *  - Authenticated users hitting /dashboard (exact) → redirect to role-based landing page
 *    (prevents the Router from seeing an intermediate route, avoiding the hooks violation)
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

function decodeRole(token: string): string | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

function getRoleLandingPage(role: string | null): string {
  if (role === "ADMIN") return "/dashboard/overview";
  if (role === "MANAGER") return "/dashboard/employees";
  return "/dashboard/profile";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("hrm-token")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isDashboard = pathname.startsWith("/dashboard");

  // ─── Not authenticated → guard dashboard routes ───────────────────────────
  if (isDashboard && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Authenticated on /dashboard (exact) → redirect to role landing page ──
  // Avoids the React Router "Rendered more hooks" error caused by the
  // server component redirect changing route segment depth mid-render.
  if (pathname === "/dashboard" && token) {
    const role = decodeRole(token);
    if (!role) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("hrm-token");
      return res;
    }
    return NextResponse.redirect(new URL(getRoleLandingPage(role), request.url));
  }

  // ─── Already authenticated → skip public pages ───────────────────────────
  if (isPublic && token) {
    const role = decodeRole(token);
    return NextResponse.redirect(new URL(getRoleLandingPage(role), request.url));
  }

  // ─── Role-based protection ────────────────────────────────────────────────
  if (token && isDashboard) {
    const role = decodeRole(token);
    if (!role) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("hrm-token");
      return res;
    }

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
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",        // exact match — handles root redirect without server component
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
