"use client";
import React from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { Radio } from "antd";
import { usePathname, useRouter } from "next/navigation";

const AnalyticsPage = ({ children }) => {
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
    { label: "ACADEMIC DETAILS", value: "/student/profile/analytics/academicResults" },
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
      <StudentPageHeader section="Profile" title="Analytics" />
      <div>
        <Radio.Group
          block={true}
          options={options}
          value={currentTab}
          optionType="button"
          buttonStyle="solid"
          onChange={(e) => nav.push(e.target.value)}
        />
      </div>
      <div className="mt-4 h-[90%] overflow-y-scroll [&::-webkit-scrollbar]:hidden">{children}</div>
    </div>
  );
};

export default AnalyticsPage;
