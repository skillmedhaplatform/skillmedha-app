import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login?portal=student");
  }

  // Authenticated users are handled by (protected)/layout.js
  // which redirects to /tests or /profile/basic-details based on org type
  redirect("/dashboard");
}
