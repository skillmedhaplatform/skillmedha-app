"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

export default function PracticeBannerTabs() {
  const router = useRouter();
  const currPath = usePathname();

  const categoryTabs = [
    { name: "Non-Technical", path: "/student/practice-new/nontechnical" },
    { name: "Coding", path: "/student/practice-new/coding" },
    { name: "Technical", path: "/student/practice-new/technical" },
  ];

  return (
    <div className="flex gap-3 mt-1">
      {categoryTabs.map((tab) => {
        const isActive = currPath === tab.path;
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
