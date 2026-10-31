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

function getPublicOrigin(request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host && !host.includes("localhost")) {
    return `${proto}://${host}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return request.nextUrl.origin;
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const publicOrigin = getPublicOrigin(request);

  // ── 0. Static assets bypass ──────────────────────────────────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot|xlsx|csv|pdf|html|json)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Redirect /dashboard to /student/dashboard
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return NextResponse.redirect(new URL("/student/dashboard", publicOrigin));
  }

  if (pathname.startsWith("/portal")) {
    if (!token) {
      const loginUrl = new URL("/login", publicOrigin);
      loginUrl.searchParams.set("portal", "student");
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // We run middleware logic on /student, /admin, and /dashboard routes
  if (!pathname.startsWith("/student") && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // ── 0a. Admin Auth ────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!token && !pathname.startsWith("/admin/login")) {
      const loginUrl = new URL("/admin/login", publicOrigin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // We can add further role-based checks here if necessary
    return NextResponse.next();
  }

  // ── 0. Fresh login redirect — token arriving via URL query param ──────────
  const urlToken = request.nextUrl.searchParams.get("token");
  if (!token && urlToken && !pathname.startsWith("/api/auth/init-session")) {
    const initUrl = new URL("/api/auth/init-session", publicOrigin);
    initUrl.searchParams.set("token", urlToken);
    const returnTarget = (pathname === "/dashboard" || pathname === "/") ? "/student/dashboard" : pathname;
    initUrl.searchParams.set("returnTo", returnTarget);
    const sId = request.nextUrl.searchParams.get("sId");
    if (sId) initUrl.searchParams.set("sId", sId);
    return NextResponse.redirect(initUrl);
  }

  // ── 1. Retrieve Session Permissions ──────────────────────────────────────
  const permissionsCookie = request.cookies.get("permissions")?.value;
  const session = token ? (await decryptSession(permissionsCookie)) || {} : null;

  // ── 2a. Permissions cookie missing / corrupt ──────────────────────────────
  if (token && !permissionsCookie && !pathname.startsWith("/api/auth/refresh")) {
    const refreshUrl = new URL("/api/auth/refresh", publicOrigin);
    const normalizedPath = (pathname === "/dashboard" || pathname === "/") ? "/student/dashboard" : pathname;
    const fullPath = normalizedPath + (request.nextUrl.search || "");
    refreshUrl.searchParams.set("returnTo", fullPath);
    return NextResponse.redirect(refreshUrl);
  }

  // ── 3. Auth: must have token ─────────────────────────────────────────────
  if (!token) {
    const loginUrl = new URL("/login", publicOrigin);
    loginUrl.searchParams.set("portal", "student");
    const callbackTarget = (pathname === "/dashboard" || pathname === "/") ? "/student/dashboard" : pathname;
    loginUrl.searchParams.set("callbackUrl", callbackTarget);
    return NextResponse.redirect(loginUrl);
  }

  // ── 4. Special Organization Routing ──────────────────────────────────────
  if (session && session.special === true) {
    const specialAllowed = ["/student/tests", "/student/testResults", "/student/blocked", "/student/api"];
    const isAllowed = specialAllowed.some((p) => pathname.startsWith(p));
    if (!isAllowed) {
      const url = new URL("/student/blocked", publicOrigin);
      url.searchParams.set("reason", "restricted-org");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── 4b. Block normal users from /testResults ──────────────────────────────
  // Removed block to allow access to the custom Test Results page


  // ── 5. Email Verification check ───────────────────────────────────────────
  if (!isUnverifiedAllowed(pathname)) {
    if (session.ev !== true) {
      const url = new URL("/student/verify-email", publicOrigin);
      url.searchParams.set("reason", "email-not-verified");
      return NextResponse.redirect(url);
    }
  }

  // ── 6. Psychometric Test Gate (Disabled for all students) ─────────────────
  // Note: Psychometric test is currently disabled for all students.
  // if (!isPsychometricExempt(pathname) && session.pt === false) {
  //   return NextResponse.redirect(new URL("/student/testPortal", publicOrigin));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot|xlsx|csv|pdf|html|json)$).*)",
  ],
};
