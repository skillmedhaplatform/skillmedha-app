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
import CardSkeleton from "@/app/student/(protected)/tests/reusable_comp/cardSkeleton";

const isTestExpired = (test) => {
  const status = test?.status?.toLowerCase();
  if (status === "expired" || status === "completed") {
    return true;
  }
  const expiryDate =
    test?.time?.expiryDates?.accessClosingDate ||
    test?.time?.expiryDates?.testExpirationData;
  const hasExpiry = test?.time?.expiryDates?.expiry && expiryDate;
  if (hasExpiry) {
    const targetDate = new Date(expiryDate).getTime();
    return targetDate - new Date().getTime() <= 0;
  }
  return false;
};

export default function JobAssessments() {
  const dispatch = useDispatch();
  const nav = useRouter();
  const [countdowns, setCountdowns] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [columns, setColumns] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1920) setColumns(6);
      else if (window.innerWidth >= 1600) setColumns(5);
      else setColumns(0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const studentCreds = useSelector((state) => state.student.student?.data);

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

  const attemptedTestIds = [...new Set((studentCreds?.progress || []).map(p => p.testId))];

  // Filter tests based on tab
  const filteredTests = jobData?.filter((test) => {
    const expired = isTestExpired(test);
    const isAttempted = attemptedTestIds.includes(test?._id);

    if (activeTab === "all") return true;
    if (activeTab === "active") return !expired && test?.status?.toLowerCase() === "active";
    if (activeTab === "expired") return expired;
    if (activeTab === "results") return isAttempted;
    return true;
  });

  const activeCount = jobData?.filter(t => !isTestExpired(t) && t?.status?.toLowerCase() === "active").length || 0;
  const expiredCount = jobData?.filter(isTestExpired).length || 0;
  const resultsCount = jobData?.filter(t => attemptedTestIds.includes(t?._id)).length || 0;

  const bannerStats = (
    <div className="flex items-center gap-8 pr-4">
      <div className="flex flex-col items-center">
        <span className="text-[32px] font-extrabold leading-none text-white">{jobData?.length || 0}</span>
        <span className="text-[14px] text-white/70 font-semibold tracking-wide">Total</span>
      </div>

      {(activeTab === "all" || activeTab === "active") && (
        <>
          <div className="w-[1px] h-12 bg-white/20"></div>
          <div className="flex flex-col items-center">
            <span className="text-[32px] font-extrabold leading-none text-white">{activeCount}</span>
            <span className="text-[14px] text-white/70 font-semibold tracking-wide">Active</span>
          </div>
        </>
      )}

      {(activeTab === "all" || activeTab === "expired") && (
        <>
          <div className="w-[1px] h-12 bg-white/20"></div>
          <div className="flex flex-col items-center">
            <span className="text-[32px] font-extrabold leading-none text-white">{expiredCount}</span>
            <span className="text-[14px] text-white/70 font-semibold tracking-wide">Expired</span>
          </div>
        </>
      )}

      {activeTab === "results" && (
        <>
          <div className="w-[1px] h-12 bg-white/20"></div>
          <div className="flex flex-col items-center">
            <span className="text-[32px] font-extrabold leading-none text-white">{resultsCount}</span>
            <span className="text-[14px] text-white/70 font-semibold tracking-wide">Attempted</span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="relative flex flex-col bg-[#EFF5FB] h-screen overflow-hidden">
      <StudentPageHeader title="Job Assessments" subtitleSlot={<AssessmentsBannerTabs />} rightSlot={bannerStats} />

      {/* Tabs Section */}
      <div className="w-full bg-white flex items-center border-b border-gray-200 sticky top-0 z-[1]">
        <div className="flex gap-8 px-6 pt-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-4 text-[16px] font-bold transition-all border-b-[3px] ${
              activeTab === "all" ? "border-[#1E69DA] text-[#1E69DA]" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            All {jobData?.length || 0}
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-4 text-[16px] font-bold transition-all border-b-[3px] ${
              activeTab === "active" ? "border-[#1E69DA] text-[#1E69DA]" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Active {activeCount}
          </button>
          <button
            onClick={() => setActiveTab("expired")}
            className={`pb-4 text-[16px] font-bold transition-all border-b-[3px] ${
              activeTab === "expired" ? "border-[#1E69DA] text-[#1E69DA]" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Expired {expiredCount}
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`pb-4 text-[16px] font-bold transition-all border-b-[3px] ${
              activeTab === "results" ? "border-[#1E69DA] text-[#1E69DA]" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Results {resultsCount}
          </button>
        </div>
      </div>

      <section className="w-full flex-1 overflow-y-auto px-4 mt-8 pb-12 [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#e2e8f0] [&::-webkit-scrollbar-thumb]:rounded-[20px] [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent">
        <div 
          className={`grid gap-6 overflow-hidden ${columns === 0 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}`}
          style={columns > 0 ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : {}}
        >
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : filteredTests?.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
              <div className="text-[16px] text-[#475467] font-semibold flex items-center gap-2">
                {activeTab === "results" ? (
                  <span className="flex flex-col items-center gap-3">
                    <span className="text-5xl mb-2">📊</span>
                    <span className="max-w-[400px]">There are no assessments to see results for. Try attempting one to check out your results!</span>
                  </span>
                ) : activeTab === "expired" ? (
                  <span className="flex flex-col items-center gap-3">
                    <span className="text-5xl mb-2">⏳</span>
                    <span className="max-w-[400px]">No expired assessments at the moment. You're all caught up!</span>
                  </span>
                ) : activeTab === "active" ? (
                  <span className="flex flex-col items-center gap-3">
                    <span className="text-5xl mb-2">🚀</span>
                    <span className="max-w-[400px]">No active assessments right now. Check back later for new ones!</span>
                  </span>
                ) : (
                  <span className="flex flex-col items-center gap-3">
                    <span className="text-5xl mb-2">📭</span>
                    <span className="max-w-[400px]">No job assessments available right now. Check back soon!</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            filteredTests?.map((e, index) => {
              return (
                <div
                  key={e._id}
                  className="w-full h-full"
                  onClick={() => {
                    sessionStorage.setItem("selectedTest", e?._id);
                  }}
                >
                  <TestCard
                    testData={e}
                    navigateToTest={navigateToTest}
                    questionLength={e?.questions?.length}
                    index={index}
                    countdowns={countdowns}
                    isAssessment={true}
                    isTestActivated={true}
                    isResultTab={activeTab === 'results'}
                  />
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
