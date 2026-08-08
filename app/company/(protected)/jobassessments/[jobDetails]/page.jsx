"use client";

import { GetOneJob } from "@/redux/slices/company/placementsSlice";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import jdStyles from "./page.module.scss";
import "./antd.css";
import {
  getAllAppliedStudents,
  resetAllAppliedStudents,
} from "@/redux/slices/company/skillMedhaData";
import Applicants from "./comps/applicants";
import AssessmentTaken from "./comps/assessmentTaken";
import Interviews from "./comps/interviews";
import PageHeader from "@/modules/tpo/components/PageHeader";

const options = [
  { label: "Applicants", value: "Applicants" },
  { label: "Assessments Taken", value: "Assessments Taken" },
  { label: "Scheduled interviews", value: "Scheduled interviews" },
];

const Page = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { jobDetails } = params;

  const { value: { data: oneJobData } = {}, status } = useSelector(
    (state) => state.placement.OneJob || {}
  );

  const appliedStudents = useSelector((s) => s.skillmedha?.appliedStudents ?? {});

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // State for selected tab
  const [selectedTab, setSelectedTab] = useState("Applicants");

  useEffect(() => {
    if (jobDetails) {
      // reset before fetching new job
      dispatch(
        getAllAppliedStudents({
          studentIds: oneJobData?.applicants?.map((e) => e?._id),
          jobId: jobDetails,
          assessmentId: oneJobData?.AssessmentId,
        })
      );
      dispatch(resetAllAppliedStudents());
      dispatch(GetOneJob({ jobid: jobDetails }));
    }
  }, [jobDetails, dispatch]);

  // 2️⃣ Fetch applied students only when oneJobData updates successfully
  useEffect(() => {
    if (
      status === "succeeded" &&
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
  }, [oneJobData, status, jobDetails, dispatch]);

  if (!mounted) return null;
  return (
    <>
      <div className={jdStyles.container}>
        {/* Header Banner */}
        <PageHeader 
          title={oneJobData?.jobTitle ? `${oneJobData.jobTitle} Insights` : "Job Assessment Insights"} 
          subtitle="View and manage insights, applicants, and assessments" 
        />

        {/* Tabs */}
        <div className={jdStyles.tabsWrapper}>
          <div className={jdStyles.tabsRow}>
            {options.map((opt) => {
              const isActive = selectedTab === opt.value;
              return (
                <div
                  key={opt.value}
                  className={`${jdStyles.tabItem} ${isActive ? jdStyles.activeTab : ""}`}
                  onClick={() => setSelectedTab(opt.value)}
                >
                  <span>{opt.label}</span>
                  {isActive && <span className={jdStyles.activeIndicator} />}
                </div>
              );
            })}
          </div>
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
        </div>
      </div>
    </>
  );
};

export default Page;


