"use client";
import React from "react";
import AnalyticsStyles from "./page.module.scss";
import { Radio } from "antd";
import { useParams, usePathname, useRouter } from "next/navigation";
import StudentData from "../page";

const AnalyticsPage = ({ children }) => {
  const nav = useRouter();
  const params = useParams();
  const { departId, studentId } = params;
  const baseUrl = `/student/${studentId}/analytics`;

  const options = [
    {
      label: "Placements",
      value: `${baseUrl}/placements`,
    },
    {
      label: "Psychometric Results",
      value: `${baseUrl}/psychometricResults`,
    },
    {
      label: "ACADEMIC DETAILS",
      value: `${baseUrl}/academicResults`,
    },
    {
      label: "LMS Analysis",
      value: `${baseUrl}/academicResults`,
      disabled: true,
    },
    {
      label: "Assessment Report",
      value: `${baseUrl}/testsReport`,
      disabled: true,
    },
  ];

  const path = usePathname();

  const returnCurrTabVal = () => {
    const match = options.find((e) => e.value === path);

    if (!match) {
      const defaultPath = `${baseUrl}/placements`;
      nav.push(defaultPath);
      return defaultPath;
    }

    return match.value;
  };
  return (
    <StudentData>
      <div className={AnalyticsStyles.container}>
        <div className={AnalyticsStyles.headTitles}>
          <Radio.Group
            block={true}
            options={options}
            value={returnCurrTabVal()}
            optionType="button"
            buttonStyle="solid"
            onChange={(e) => nav.push(e.target.value)}
          />
        </div>
        <div className={AnalyticsStyles.body}>{children}</div>
      </div>
    </StudentData>
  );
};

export default AnalyticsPage;
