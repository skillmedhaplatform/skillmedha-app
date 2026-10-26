import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encryptSession } from "@/universalUtils/sessionCrypto";

const studentUrl = process.env.NEXT_PUBLIC_STUDENT_URL;
const SPECIAL_ORG_ID = process.env.NEXT_PUBLIC_SPECIAL_ORG_ID;

const PERMISSIONS_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days — matches token cookie
};

/**
 * GET /api/auth/refresh?returnTo=/dashboard
 *
 * Called by middleware when a `token` cookie exists but the `permissions`
 * cookie is missing or corrupt (e.g. it expired while token was still alive,
 * or the user opened a new browser session).
 *
 * Validates the token against the backend, re-issues the permissions cookie
 * with real values, then redirects to `returnTo`.
 *
 * On failure (invalid/deleted account): wipes token + permissions and goes to /login.
 */
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const publicOrigin = getPublicOrigin(request);
  const isJson = searchParams.get("json") === "true";

  // Sanitise returnTo — only allow relative paths to prevent open redirect
  const rawReturn = searchParams.get("returnTo") || "/student/dashboard";
  const returnTo = (rawReturn.startsWith("/") && rawReturn !== "/dashboard") ? rawReturn : "/student/dashboard";

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // No token at all → return 401 for json requests or redirect to login for browser navigation
  if (!token) {
    if (isJson) {
      return NextResponse.json({ success: false, error: "No token" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", publicOrigin));
  }

  try {
    const fetchUrl = (studentUrl || "http://localhost:4000").replace('localhost', '127.0.0.1');
    const res = await fetch(`${fetchUrl}/getStudentCreds`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      // Token is invalid or account deleted — wipe everything
      if (isJson) {
        const response = NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        response.cookies.delete("token");
        response.cookies.delete("permissions");
        return response;
      }
      const response = NextResponse.redirect(new URL("/login", publicOrigin));
      response.cookies.delete("token");
      response.cookies.delete("permissions");
      return response;
    }

    const data = await res.json();
    const student = data?.data;

    // Re-encrypt fresh permissions from real backend values
    const CUTOFF_DATE = new Date("2026-05-01T00:00:00Z").getTime();
    // If createdAt is missing, we assume they are a new user (due to a previous TPO single-student creation bug)
    // because all old users from before May 1, 2026 have createdAt populated by the DB migration.
    // If createdAt is missing completely, we treat them as a legacy user (isNewUser = false).
    const isNewUser = student?.createdAt ? new Date(student.createdAt).getTime() >= CUTOFF_DATE : false;

    const hasTakenTest = student?.psychometricTestResults && Object.keys(student.psychometricTestResults).length > 0;
    
    // NOTE: Psychometric test is currently disabled for all students.
    // To re-enable in the future, uncomment the calculation below:
    // const ptValue = Boolean(hasTakenTest || !isNewUser || (student?.loginCount > 1));
    const ptValue = true;

    const permissionsEncrypted = await encryptSession({
      // Login already requires verification, so if getStudentCreds succeeds, they are verified
      ev: true,
      special: student?.orgDetails?.orgId === SPECIAL_ORG_ID || student?.orgId === SPECIAL_ORG_ID,
      pt: ptValue,
    });

    const response = isJson
      ? NextResponse.json({ success: true })
      : NextResponse.redirect(new URL(returnTo, publicOrigin));
    response.cookies.set("permissions", permissionsEncrypted, PERMISSIONS_OPTS);
    return response;
  } catch (error) {
    console.error("[auth/refresh] error:", error);
    // Don't delete the token — could be a transient backend error.
    // Set a safe fallback permissions cookie so the user isn't stuck in a loop.
    // They'll get re-validated on the next refresh cycle.
    try {
      // Set ev: true in fallback perms so a backend timeout doesn't falsely claim unverified
      const fallbackPerms = await encryptSession({ ev: true, special: false, pt: true });
      const response = isJson
        ? NextResponse.json({ success: true, fallback: true })
        : NextResponse.redirect(new URL(returnTo, publicOrigin));
      response.cookies.set("permissions", fallbackPerms, PERMISSIONS_OPTS);
      return response;
    } catch {
      // If even encryption fails, just let the user through
      return isJson
        ? NextResponse.json({ error: "encryption_failed" }, { status: 500 })
        : NextResponse.redirect(new URL(returnTo, publicOrigin));
    }
  }
}
