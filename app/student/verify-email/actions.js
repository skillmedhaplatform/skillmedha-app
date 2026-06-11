"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { encryptSession } from "@/universalUtils/sessionCrypto";

const studentUrl = process.env.NEXT_PUBLIC_STUDENT_URL;
const SPECIAL_ORG_ID = process.env.NEXT_PUBLIC_SPECIAL_ORG_ID;

const PERMISSIONS_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

/**
 * Server Action: refreshSessionAndRedirect
 *
 * Called from the verify-email "I've Verified" button.
 * Runs entirely on the server so cookies() works correctly
 * and the Set-Cookie header is properly sent to the browser.
 *
 * Flow:
 *   1. Reads the token from the real browser cookie (server-side)
 *   2. Fetches fresh student credentials from the real student API
 *   3. Re-encrypts the permissions cookie with the real ev value from DB
 *   4. Writes the updated cookie via next/headers (guaranteed to apply)
 *   5. Redirects to /dashboard via next/navigation redirect()
 */
export async function refreshSessionAndRedirect() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const res = await fetch(`${studentUrl}/getStudentCreds`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      // Token invalid or account deleted
      cookieStore.delete("token");
      cookieStore.delete("permissions");
      redirect("/login");
    }

    const data = await res.json();
    const student = data?.data;

    // Re-encrypt permissions using the REAL values from the API — nothing hardcoded
    const permissionsEncrypted = await encryptSession({
      ev: student?.verified === true,
      special: student?.orgDetails?.orgId === SPECIAL_ORG_ID,
      pt:
        Array.isArray(student?.psychometricTestResults) &&
        student.psychometricTestResults.length > 0,
    });

    // Set the refreshed cookie server-side — this ALWAYS takes effect
    cookieStore.set("permissions", permissionsEncrypted, PERMISSIONS_OPTS);

    // If email still not verified, stay on this page with a reason
    if (student?.verified !== true) {
      redirect("/verify-email?reason=email-not-verified");
    }

  } catch (error) {
    console.error("[refreshSessionAndRedirect] error:", error);
    redirect("/login");
  }

  // Redirect only after cookie is set — outside try to avoid swallowing redirect errors
  redirect("/dashboard");
}
