"use client";

import { GetOneJob } from "@/redux/slices/company/placementsSlice";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import jdStyles from "./page.module.scss";
import { Radio } from "antd";
import "./antd.css";
import {
  getAllAppliedStudents,
  resetAllAppliedStudents,
} from "@/redux/slices/company/skillMedhaData";
import Applicants from "./comps/applicants";
import AssessmentTaken from "./comps/assessmentTaken";
import Interviews from "./comps/interviews";
import EligibleStudents from "./comps/eligibleStudents";

const options = [
  // { label: "Eligible Students", value: "Eligible Students" },
  { label: "Applicants", value: "Applicants" },
  { label: "Assessments Taken", value: "Assessments Taken" },
  { label: "Scheduled interviews", value: "Scheduled interviews" },
];

const Page = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { jobDetails } = params;

  const { value: { data: oneJobData } = {}, status } = useSelector(
    (state) => state.companyPlacements?.OneJob || {}
  );

  const appliedStudents = useSelector((s) => s.companySkillMedhaData?.appliedStudents ?? {});

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // State for selected tab
  const [selectedTab, setSelectedTab] = useState("Applicants");

  // useEffect(() => {
  //   dispatch(GetOneJob({ jobid: jobDetails }));

  //   if (oneJobData?.applicants?.length) {
  //     dispatch(
  //       getAllAppliedStudents({
  //         studentIds: oneJobData?.applicants?.map((e) => e?._id),
  //         jobId: oneJobData?._id,
  //         assessmentId: oneJobData?.AssessmentId,
  //       })
  //     );
  //   }
  // }, [jobDetails]);

  // 1️⃣ First effect → fetch job details
  // 1️⃣ First effect → fetch job details
  // 1️⃣ First effect → fetch job details
  useEffect(() => {
    if (jobDetails) {
      // reset before fetching new job

      dispatch(resetAllAppliedStudents());
      dispatch(GetOneJob({ jobid: jobDetails }));
    }
  }, [jobDetails, dispatch]);

  // 2️⃣ Fetch applied students only when oneJobData updates successfully
  useEffect(() => {
    if (
      status === "succeeded" && // ✅ wait for fetch to finish
      oneJobData?._id &&
      oneJobData?.applicants?.length
    ) {
      dispatch(
        getAllAppliedStudents({
          studentIds: oneJobData.applicants.map((e) => e?._id),
          jobId: oneJobData._id,
          assessmentId: oneJobData.AssessmentId,
        })
      );
    }
  }, [oneJobData, status, jobDetails, dispatch]); // ✅ depends on both

  if (!mounted) return null;
  return (
    <>
      <div className={jdStyles.container}>
        {/* Radio Buttons */}
        <div className={jdStyles.radioContainer}>
          <Radio.Group
            block
            options={options}
            value={selectedTab}
            onChange={(e) => setSelectedTab(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className={jdStyles.customRadio}
          />
        </div>

        {/* Content Rendering */}
        <div className={jdStyles.content}>
          {selectedTab === "Applicants" && (
            <div>
              <Applicants />
            </div>
          )}

          {selectedTab === "Assessments Taken" && (
            <div>
              <AssessmentTaken />
            </div>
          )}

          {selectedTab === "Scheduled interviews" && (
            <div>
              <Interviews />
            </div>
          )}

          {/* {selectedTab === "Eligible Students" && (
            <div>
              <EligibleStudents />
            </div>
          )} */}
        </div>
      </div>
    </>
  );
};

export default Page;
