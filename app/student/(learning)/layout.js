import { NextResponse } from "next/server";
import { getStudentCredsFromServer } from "../(protected)/dal";
import { redirect } from "next/navigation";
import LearningShell from "./LearningShell";

export default async function LearningLayout({ children }) {
  const { token, student } = await getStudentCredsFromServer();

  // No token at all — middleware already handles this, but belt-and-suspenders.
  // Safe to use redirect() here: no token means middleware lets /login through.
  if (!token) {
    redirect("/login");
  }

  // Token exists but student returned null (e.g. account deleted or connection timed out).
  // 
  // Why we do this:
  // We MUST delete the cookies before the user reaches `/login`, otherwise the 
  // middleware will see the token, block /login, and cause an infinite redirect loop.
  // Unfortunately, Next.js Server Components (like layouts) CANNOT return `NextResponse`
  // and they CANNOT call `cookies().delete()`. Doing so causes SSR crashes.
  //
  // The Solution:
  // We redirect the user to our `/api/auth/refresh` API Route Handler. 
  // Because it's an API route, it IS allowed to fetch the credentials, realize they 
  // failed, and it will safely execute `response.cookies.delete("token")` in the 
  // SAME response as the final redirect to `/login`. Loop prevented, crash avoided!
  if (token && !student) {
    redirect("/api/auth/refresh?returnTo=/login");
  }

  return (
    <LearningShell serverToken={token}>
      {children}
    </LearningShell>
  );
}
