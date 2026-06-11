import { redirect } from "next/navigation";

export default function TestportalRootPage() {
  // Automatically redirect the root route to the dashboard/myTests page
  redirect("/testportal_admin/myTests");
}
