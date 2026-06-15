"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import academicStyles from "./page.module.scss";
import { getAllDetails } from "@/redux/slices/tpo/getAllDetailsSlice";
import { useParams } from "next/navigation";
import AnalyticsPage from "../../page";

const AcademicResultsPage = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const studentDetails = useSelector(
    (state) => state.singleStudentDetails.singleStudent.value?.data
  );

  useEffect(() => {
    if (params.studentId && !studentDetails) {
      dispatch(getAllDetails(params.studentId));
    }
  }, [params.studentId, dispatch, studentDetails]);

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

export default AcademicResultsPage;
