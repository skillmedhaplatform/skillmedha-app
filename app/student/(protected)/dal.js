import { cookies } from "next/headers";

const studentUrl = process.env.NEXT_PUBLIC_STUDENT_URL;

/**
 * Data Access Layer for the protected layout.
 * Runs on the server to fetch student credentials using the auth token from cookies.
 */
export async function getStudentCredsFromServer() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { token: null, student: null };
  }

  // Optimize: Do not block page rendering by making a server-side fetch on every page transition.
  // The client-side Redux store already fetches and caches student credentials on mount if missing.
  return { token, student: {} };
}
