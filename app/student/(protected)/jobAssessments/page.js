"use client";
import React, { useEffect, useRef, useState } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import AssessmentsBannerTabs from "@/modules/student/components/AssessmentsBannerTabs";
import { useDispatch, useSelector } from "react-redux";

import { fetchAssignedAssessments } from "@/redux/slices/jobassessmentsSlice";
import { useRouter } from "next/navigation";
import { Button, Tag, Divider, Spin, Empty } from "antd";
import ResponsiveAssessmentCard from "@/mobile_views/assessments/ResponsiveAssessmentCard";
import useResponsive from "@/hooks/useResponsive";
import TestCard from "@/app/student/(protected)/tests/utils/testCard";

// AssessmentCard removed, using shared TestCard instead

export default function JobAssessments() {
  const dispatch = useDispatch();
  const nav = useRouter();
  const [countdowns, setCountdowns] = useState({});
  const [loading, setLoading] = useState(false);

  const ReduxState = useSelector((state) => ({
    jobAssessments: {
      assessments: state.jobassessments.assessments.value?.data || [],
      totalCount:
        state.jobassessments.assessments.value?.pagination?.totalAssessments ||
        0,
    },
  }));

  const jobData = ReduxState?.jobAssessments?.assessments || [];

  // ===== COUNTDOWN EFFECT =====
  useEffect(() => {
    const intervalId = setInterval(() => {
      const updatedCountdowns = {};

      jobData.forEach((job, index) => {
        // Adjust these field names based on your job/assessment data structure
        const expiryDate =
          job?.time?.expiryDates?.accessClosingDate ||
          job?.time?.expiryDates?.testExpirationData ||
          job?.expiryDate ||
          job?.endDate;

        // Adjust this condition based on your data structure
        const hasExpiry =
          job?.time?.expiryDates?.expiry || job?.hasExpiry || expiryDate;

        if (hasExpiry && expiryDate) {
          const targetDate = new Date(expiryDate);
          const today = new Date();
          const timeDifference = targetDate - today;

          if (timeDifference > 0) {
            let days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            let hours = Math.floor(
              (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            let minutes = Math.floor(
              (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
            );
            let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

            hours = String(hours).padStart(2, "0");
            minutes = String(minutes).padStart(2, "0");
            seconds = String(seconds).padStart(2, "0");

            if (days > 0) {
              days = String(days).padStart(2, "0");
              updatedCountdowns[
                index
              ] = `${days}:${hours}:${minutes}:${seconds}`;
            } else {
              updatedCountdowns[index] = `${hours}:${minutes}:${seconds}`;
            }
          } else {
            updatedCountdowns[index] = "Expired";
          }
        } else {
          updatedCountdowns[index] = "No expiry set";
        }
      });

      setCountdowns(updatedCountdowns);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [jobData]);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchAssignedAssessments()).finally(() => {
      setLoading(false);
    });
  }, [dispatch]);

  const navigateToTest = (job) => {
    // Store selected test in session storage
    sessionStorage.setItem("selectedTest", job?._id);

    return nav.replace(
      "/student/jobAssessments/" +
      job?.jobTitle.split(" ").join("-") +
      "?testId=" +
      job?._id
    );
  };

  const renderLoadingState = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
        minHeight: "200px",
      }}
    >
      <Spin size="large" />
    </div>
  );

  const renderEmptyState = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        minHeight: "200px",
      }}
    >
      <Empty description="No job assessments found" />
    </div>
  );

  const renderAssessmentCards = () =>
    jobData.map((job, index) => (
      <div key={job._id} className="w-full h-full">
        <TestCard
          testData={job}
          index={index}
          countdowns={countdowns}
          isTestActivated={true}
          navigateToTest={navigateToTest}
          isAssessment={true}
        />
      </div>
    ));

  const renderContent = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (jobData.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(22rem,1fr))] gap-[10px] pb-[70px] min-h-[60vh] max-h-[90vh] p-4">
        {renderAssessmentCards()}
      </div>
    );
  };

  return (

    <div className="h-full overflow-hidden flex flex-col gap-2 p-4 bg-[#EFF5FB]">
      <StudentPageHeader section="Assessment" title="Job Assessments" subtitleSlot={<AssessmentsBannerTabs />} />
      <div className="w-full flex justify-between items-center">
        <h2 className="w-[80%] text-[1.2rem] font-bold text-[#24A058] m-0 mb-4">Job Assessments</h2>
      </div>
      <section className="py-4 overflow-y-auto h-[70vh] p-4 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#24A058] [&::-webkit-scrollbar-thumb]:rounded-[6px] hover:[&::-webkit-scrollbar-thumb]:bg-[#1b8184]">{renderContent()}</section>
    </div>

  );
}
