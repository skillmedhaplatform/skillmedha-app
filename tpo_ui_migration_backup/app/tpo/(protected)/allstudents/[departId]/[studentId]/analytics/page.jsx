"use client";
import React, { useEffect } from "react";
import AnalyticsStyles from "./page.module.scss";
import { Radio } from "antd";
;
import { getAllDetails } from "@/redux/slices/tpo/getAllDetailsSlice";
import { useDispatch, useSelector } from "react-redux";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import PageHeader from "@/modules/tpo/components/PageHeader";

const AnalyticsPage = ({ children }) => {
  const nav = useRouter();
  const dispatch = useDispatch();
  const params = useParams();
  const { departId, studentId } = params;
  const baseUrl = `/tpo/allstudents/${departId}/${studentId}/analytics`;
  const selectedStudent = useSelector(
    (state) => state.singleStudentDetails.singleStudent.value
  );

  const options = [
    {
      label: "Placements",
      value: `${baseUrl}/placements`
    },
    {
      label: "Psychometric Results",
      value: `${baseUrl}/psychometricResults`
    },
    {
      label: "ACADEMIC DETAILS",
      value: `${baseUrl}/academicResults`
    },
    // {
    //   label: "LMS Analysis",
    //   value: `${baseUrl}/academicResults`,
    //   disabled: true,
    // },
    // {
    //   label: "Assessment Report",
    //   value: `${baseUrl}/testsReport`,
    //   disabled: true,
    // },
  ];

  useEffect(() => {
    if (params.studentId && !selectedStudent?.data) {
      dispatch(getAllDetails(params.studentId));
    }
  }, [params.studentId, dispatch, selectedStudent?.data]);
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
    <>
      <PageHeader title="Analytics" />

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
    </>

  );
};

export default AnalyticsPage;
