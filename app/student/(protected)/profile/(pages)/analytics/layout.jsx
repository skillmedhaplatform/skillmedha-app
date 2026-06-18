"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";

const AnalyticsLayout = ({ children }) => {
  const nav = useRouter();

  const options = [
    {
      label: "Placements",
      value: "/student/profile/analytics/placements",
    },
    {
      label: "Psychometric Results",
      value: "/student/profile/analytics/psychometricResults",
    },
    {
      label: "Academic Details",
      value: "/student/profile/analytics/academicResults",
    },
  ];

  const path = usePathname();

  const match = options.find((e) => e.value === path);

  React.useEffect(() => {
    if (!match) {
      nav.push("/student/profile/analytics/placements");
    }
  }, [match, nav]);

  const currentTab = match ? match.value : "/student/profile/analytics/placements";

  return (
    <div className="h-full">
      <div style={{ display: "flex", gap: "10px", background: "#f8fafc", padding: "6px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
        {options.map((opt) => {
          const isActive = currentTab === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => nav.push(opt.value)}
              style={{
                flex: 1,
                border: "none",
                background: isActive ? "linear-gradient(135deg, #1E69DA, #5694F0)" : "transparent",
                color: isActive ? "white" : "#64748b",
                fontWeight: "700",
                fontSize: "0.85rem",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 h-[90%] overflow-y-scroll [&::-webkit-scrollbar]:hidden">{children}</div>
    </div>
  );
};

export default AnalyticsLayout;

