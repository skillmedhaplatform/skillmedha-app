import "./student-globals.css";
import { Nunito } from "next/font/google";
import Providers from "./Providers";
import { Suspense } from "react";
import StudentSessionBridge from "@/modules/student/components/StudentSessionBridge";
import StudentPortalBackGuard from "@/modules/student/components/StudentPortalBackGuard";

const nunito = Nunito({
  subsets: ["latin"],
});

export const metadata = {
  title: "Student Portal | SkillMedha",
  description: "SkillMedha Student Dashboard",
};

export default function StudentLayout({ children }) {
  return (
    <div className={`${nunito.className} container min-h-screen`}>
      <Providers>
        <Suspense fallback={null}>
          <StudentSessionBridge>
            <StudentPortalBackGuard>
              {children}
            </StudentPortalBackGuard>
          </StudentSessionBridge>
        </Suspense>
      </Providers>
    </div>
  );
}
