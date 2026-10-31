import { NextResponse } from "next/server";

const TOKEN_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

function getPublicOrigin(request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host && !host.includes("localhost")) {
    return `${proto}://${host}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return new URL(request.url).origin;
}

/**
 * GET /api/auth/init-session?token=...&returnTo=/student/dashboard
 *
 * Called by the middleware when a fresh login redirect arrives with the token
 * in the URL query string (set by the unified login portal).
 *
 * This route sets the httpOnly `token` cookie on the student portal's origin,
 * then redirects to `returnTo`. The middleware will then see the token on the
 * next request and call /api/auth/refresh to fetch real permissions.
 *
 * No `permissions` cookie is set — the middleware automatically calls
 * /api/auth/refresh to get real { ev, pt, special } values from the backend.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const publicOrigin = getPublicOrigin(request);

  const token = searchParams.get("token");
  const sId = searchParams.get("sId");
  const rawReturn = searchParams.get("returnTo") || "/student/dashboard";
  const returnTo = (rawReturn.startsWith("/") && rawReturn !== "/dashboard") ? rawReturn : "/student/dashboard";

  if (!token) {
    return NextResponse.redirect(new URL("/login", publicOrigin));
  }

  // Build the redirect URL with token + sId so the client-side
  // StudentSessionBridge can store them in localStorage for API calls.
  const redirectUrl = new URL(returnTo, publicOrigin);
  redirectUrl.searchParams.set("token", token);
  if (sId) redirectUrl.searchParams.set("sId", sId);

  // Redirect to the real page with the httpOnly cookie set.
  // The middleware will then trigger /api/auth/refresh to get real permissions.
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set("token", token, TOKEN_OPTS);
  return response;
}

