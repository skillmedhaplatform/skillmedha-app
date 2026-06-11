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
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);

  // Sanitise returnTo — only allow relative paths to prevent open redirect
  const rawReturn = searchParams.get("returnTo") || "/dashboard";
  const returnTo = rawReturn.startsWith("/") ? rawReturn : "/dashboard";

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // No token at all → just go to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  try {
    const res = await fetch(`${studentUrl}/getStudentCreds`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      // Token is invalid or account deleted — wipe everything
      const response = NextResponse.redirect(new URL("/login", origin));
      response.cookies.delete("token");
      response.cookies.delete("permissions");
      return response;
    }

    const data = await res.json();
    const student = data?.data;

    // Re-encrypt fresh permissions from real backend values
    const CUTOFF_DATE = new Date("2026-05-01T00:00:00Z").getTime();
    const isNewUser = student?.createdAt && student.createdAt >= CUTOFF_DATE;

    const permissionsEncrypted = await encryptSession({
      // Login already requires verification, so if getStudentCreds succeeds, they are verified
      ev: true,
      special: student?.orgDetails?.orgId === SPECIAL_ORG_ID || student?.orgId === SPECIAL_ORG_ID,
      pt:
        (Array.isArray(student?.psychometricTestResults) &&
          student.psychometricTestResults.length > 0) || !isNewUser,
    });

    const isJson = searchParams.get("json") === "true";
    const response = isJson
      ? NextResponse.json({ success: true })
      : NextResponse.redirect(new URL(returnTo, origin));
    response.cookies.set("permissions", permissionsEncrypted, PERMISSIONS_OPTS);
    return response;
  } catch (error) {
    console.error("[auth/refresh] error:", error);
    // Don't delete the token — could be a transient backend error.
    // Set a safe fallback permissions cookie so the user isn't stuck in a loop.
    // They'll get re-validated on the next refresh cycle.
    const isJson = searchParams.get("json") === "true";
    try {
      // Set ev: true in fallback perms so a backend timeout doesn't falsely claim unverified
      const fallbackPerms = await encryptSession({ ev: true, special: false, pt: true });
      const response = isJson
        ? NextResponse.json({ success: true, fallback: true })
        : NextResponse.redirect(new URL(returnTo, origin));
      response.cookies.set("permissions", fallbackPerms, PERMISSIONS_OPTS);
      return response;
    } catch {
      // If even encryption fails, just let the user through
      return isJson
        ? NextResponse.json({ error: "encryption_failed" }, { status: 500 })
        : NextResponse.redirect(new URL(returnTo, origin));
    }
  }
}
