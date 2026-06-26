import { NextResponse } from "next/server";
import { decryptSession } from "@/universalUtils/sessionCrypto";

// Routes that unverified users (ev !== true) can still access
const UNVERIFIED_ALLOWED = [
  "/student/verify-email", 
  "/student/help",         
  "/student/testPortal",   
  "/student/tests",        
];

function isUnverifiedAllowed(pathname) {
  return UNVERIFIED_ALLOWED.some((p) => pathname.startsWith(p));
}

// Routes exempt from the psychometric test gate
const PSYCHOMETRIC_EXEMPT = [
  "/student/testPortal",
  "/student/verify-email",
  "/student/help",
  "/student/api",
  "/student/blocked",
];

function isPsychometricExempt(pathname) {
  return PSYCHOMETRIC_EXEMPT.some((p) => pathname.startsWith(p));
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // ── 0. Portal Route Protection ───────────────────────────────────────────
  if (pathname.endsWith(".xlsx") || pathname.endsWith(".csv")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/portal")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("portal", "student");
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // We run middleware logic on /student and /admin routes
  if (!pathname.startsWith("/student") && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // ── 0a. Admin Auth ────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!token && !pathname.startsWith("/admin/login")) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // We can add further role-based checks here if necessary
    return NextResponse.next();
  }

  // ── 0. Fresh login redirect — token arriving via URL query param ──────────
  const urlToken = request.nextUrl.searchParams.get("token");
  if (!token && urlToken && !pathname.startsWith("/api/auth/init-session")) {
    const initUrl = new URL("/api/auth/init-session", request.url);
    initUrl.searchParams.set("token", urlToken);
    initUrl.searchParams.set("returnTo", pathname);
    const sId = request.nextUrl.searchParams.get("sId");
    if (sId) initUrl.searchParams.set("sId", sId);
    return NextResponse.redirect(initUrl);
  }

  // ── 1. Retrieve Session Permissions ──────────────────────────────────────
  const permissionsCookie = request.cookies.get("permissions")?.value;
  const session = token ? await decryptSession(permissionsCookie) || {} : null;

  // ── 2a. Permissions cookie missing / corrupt ──────────────────────────────
  if (token && !permissionsCookie && !pathname.startsWith("/api/auth/refresh")) {
    const refreshUrl = new URL("/api/auth/refresh", request.url);
    const fullPath = pathname + (request.nextUrl.search || "");
    refreshUrl.searchParams.set("returnTo", fullPath);
    return NextResponse.redirect(refreshUrl);
  }

  // ── 3. Auth: must have token ─────────────────────────────────────────────
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("portal", "student");
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 4. Special Organization Routing ──────────────────────────────────────
  if (session && session.special === true) {
    const specialAllowed = ["/student/tests", "/student/testResults", "/student/blocked", "/student/api"];
    const isAllowed = specialAllowed.some((p) => pathname.startsWith(p));
    if (!isAllowed) {
      const url = new URL("/student/blocked", request.url);
      url.searchParams.set("reason", "restricted-org");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── 4b. Block normal users from /testResults ──────────────────────────────
  if (pathname.startsWith("/student/testResults")) {
    const url = new URL("/student/blocked", request.url);
    url.searchParams.set("reason", "restricted-page");
    return NextResponse.redirect(url);
  }

  // ── 5. Email Verification check ───────────────────────────────────────────
  if (!isUnverifiedAllowed(pathname)) {
    if (session.ev !== true) {
      const url = new URL("/student/verify-email", request.url);
      url.searchParams.set("reason", "email-not-verified");
      return NextResponse.redirect(url);
    }
  }

  // ── 6. Psychometric Test Gate ─────────────────────────────────────────────
  if (!isPsychometricExempt(pathname) && session.pt === false) {
    return NextResponse.redirect(new URL("/student/testPortal", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
