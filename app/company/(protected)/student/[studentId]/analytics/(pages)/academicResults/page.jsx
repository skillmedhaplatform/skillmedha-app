"use client";
import React from "react";
import AnalyticsPage from "../../page";
import { useSelector } from "react-redux";
import academicStyles from "./page.module.scss";

const page = () => {
  const studentDetails = useSelector(
    (state) => state.user.singleStudent?.value?.data?.student
  );

  const latestEduObj = studentDetails?.educationDetails?.length
    ? studentDetails.educationDetails[
        studentDetails.educationDetails.length - 1
      ]
    : {};
  return (
    <AnalyticsPage>
      <div className={academicStyles.card}>
        <h2>{latestEduObj?.degreeName}</h2>
        <div>{latestEduObj?.department}</div>
        <div>
          <strong>{latestEduObj?.grade || 0}</strong> CGPA -{" "}
          <strong>{(latestEduObj?.grade * 9.5 || 0).toFixed(2)}</strong>%
        </div>

        <div>
          {latestEduObj?.startDate} - {latestEduObj?.endDate} |{" "}
          {latestEduObj?.city}
        </div>

        <div>{latestEduObj?.description}</div>
      </div>
    </AnalyticsPage>
  );
};

export default page;
