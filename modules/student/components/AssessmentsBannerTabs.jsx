"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AssessmentsBannerTabs() {
  const router = useRouter();
  const currPath = usePathname();

  const categoryTabs = [
    { name: "My Tests", path: "/student/tests" },
    { name: "Job Assessments", path: "/student/jobAssessments" },
  ];

  return (
    <div className="flex gap-3 -mt-2">
      {categoryTabs.map((tab) => {
        // Strict match or startsWith depending on how nested they are, but these seem to be top level.
        const isActive = currPath === tab.path || currPath.startsWith(tab.path + "/");
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            className={`px-5 py-1.5 rounded-lg text-[14px] font-medium transition-all duration-300 border cursor-pointer ${
              isActive
                ? "bg-white/5 backdrop-blur-md border-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.1)] text-white"
                : "bg-transparent text-white/90 border-white/40 hover:bg-white/10"
            }`}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
