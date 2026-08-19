"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import TestCard from "./utils/testCard";
import _ from "lodash";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  fetchAllTests,
  fetchAllTestsByCategory,
  fetchTestData,
} from "@/redux/slices/assessmentsSlice/testSlice";
import AssessmentsBannerTabs from "@/modules/student/components/AssessmentsBannerTabs";

import { Button, message, Modal, notification, Spin, Pagination } from "antd";
import { getLstorage, getSstorage } from "@/universalUtils/windowMW";
import { formVals } from "@/redux/slices/assessmentsSlice/userForm";
import CardSkeleton from "./reusable_comp/cardSkeleton";
import { getStudent, getStudentCreds } from "@/redux/slices/student";

const PAGE_LIMIT = 10;

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

export default function Tests() {
  const allTests = useSelector((state) => state.tests?.allTests || []);
  const pageinfo = useSelector((state) => state.tests?.pageinfo || {});
  const studentCreds = useSelector((state) => state.student.student?.data);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [lastRespondents, setLastRespondents] = useState("");
  const [codeIn, setCodeIn] = useState("");
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

  const nav = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useDispatch();

  // Read limit from URL (e.g. /tests?limit=20), default 10
  const limitFromUrl = parseInt(searchParams.get("limit") || PAGE_LIMIT, 10);

  // Initial fetch on mount (or when limit changes via URL)
  useEffect(() => {
    if (!studentCreds?._id) return;
    setLoading(true);
    dispatch(getStudentCreds());
    dispatch(fetchAllTests({ limit: limitFromUrl })).finally(() => {
      setLoading(false);
    });
  }, [limitFromUrl, studentCreds?._id]);

  // Load More: pass next page
  const fetchMore = useCallback(() => {
    if (!pageinfo?.hasNextPage || loadingMore) return;
    setLoadingMore(true);
    dispatch(fetchAllTests({ cursor: pageinfo.endCursor, limit: limitFromUrl })).finally(() => {
      setLoadingMore(false);
    });
  }, [pageinfo, limitFromUrl, loadingMore]);

  const submitCode = () => {
    dispatch(formVals({}));

    dispatch(fetchTestData({ testId: getSstorage("selectedTest") })).then(
      ({ payload }) => {
        const SingleTest = payload.test;
        const studentAttemptedLength = studentCreds?.progress?.filter(
          (progress) => progress?.testId == SingleTest?._id && (progress?.attemptGeneration || 0) === (SingleTest?.attemptGeneration || 0),
        )?.length;

        const totalAttemps = SingleTest?.access?.attemptsPerRespondent;
        const maxAttemptsNum = Number(totalAttemps);
        const isUnlimited =
          totalAttemps === undefined ||
          totalAttemps === null ||
          totalAttemps === "" ||
          maxAttemptsNum === -1 ||
          totalAttemps === "unlimited";

        if (!isUnlimited && studentAttemptedLength >= maxAttemptsNum) {
          message.error(<strong>Maximum attempts already reached</strong>);
        } else {
          if (SingleTest?.access?.type == "private") {
            setShowPopup(false);
            const filteredRespondents = SingleTest?.access?.respondents?.filter(
              (resp) => resp?.email == studentCreds?.email,
            );
            const lastRespondent =
              filteredRespondents?.[filteredRespondents?.length - 1];

            if (
              lastRespondent?.email !== studentCreds?.email ||
              !lastRespondent
            ) {
              notification.info({
                message: "Notification",
                description: "Student not allowed to take this test",
                showProgress: true,
                placement: "top",
              });

              setShowPopup(false);
            } else {
              if (SingleTest?.status?.toLowerCase() == "active") {
                if (lastRespondent?.accessCode == codeIn) {
                  return nav.replace(
                    "/student/tests/" +
                    SingleTest?.title.split(" ").join("-") +
                    "?testId=" +
                    SingleTest?._id,
                  );
                } else {
                  if (
                    codeIn.length == 0 &&
                    codeIn !== undefined &&
                    codeIn !== null &&
                    codeIn !== ""
                  ) {
                    message.error("Access code is incorrect");
                  }
                }
              } else {
                message.info(
                  `The test you're trying to access is ${SingleTest?.status} and not active yet`,
                );
              }
            }
          } else {
            if (
              SingleTest?.access?.type?.toLowerCase() == "public" ||
              !SingleTest?.access?.type?.toLowerCase()
            ) {
              if (SingleTest?.status?.toLowerCase() == "active") {
                if (
                  studentCreds?.progress?.find(
                    (progress) => progress?.testId == SingleTest?._id,
                  )
                ) {
                  setShowPopup(true);
                } else {
                  return nav.replace(
                    "/student/tests/" +
                    SingleTest?.title.split(" ").join("-") +
                    "?testId=" +
                    SingleTest?._id,
                  );
                }
              } else {
                message.warning(
                  `The test you're trying to access is ${SingleTest?.status} and not active yet`,
                );
              }
            }
          }
        }
      },
    );
  };

  const navigateToTest = (e) => {
    return nav.replace(
      "/student/tests/" + e?.title.split(" ").join("-") + "?testId=" + e?._id,
    );
  };

  const attemptedTestIds = [...new Set((studentCreds?.progress || []).map(p => p?.testId))];

  // Filter tests based on tab
  const filteredTests = allTests?.filter((test) => {
    const expired = isTestExpired(test);
    const isAttempted = attemptedTestIds.includes(test?._id);

    if (activeTab === "all") return true;
    if (activeTab === "active") return !expired && test?.status?.toLowerCase() === "active";
    if (activeTab === "expired") return expired;
    if (activeTab === "results") return isAttempted;
    return true;
  });

  const activeCount = allTests?.filter(t => !isTestExpired(t) && t?.status?.toLowerCase() === "active").length || 0;
  const expiredCount = allTests?.filter(isTestExpired).length || 0;
  const resultsCount = allTests?.filter(t => attemptedTestIds.includes(t?._id)).length || 0;

  const bannerStats = (
    <div className="flex items-center gap-4 lg:gap-8 pr-2 lg:pr-4">
      <div className="hidden md:flex items-center gap-8">
        <div className="flex flex-col items-center">
          <span className="text-[32px] font-extrabold leading-none text-white">{allTests?.length || 0}</span>
          <span className="text-[14px] text-white/70 font-semibold tracking-wide">Total tests</span>
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
      <div className="flex md:hidden">
        <AssessmentsBannerTabs />
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 flex flex-col bg-[#EFF5FB] overflow-hidden overscroll-none">
      <StudentPageHeader title="Tests" subtitleSlot={<div className="hidden md:block"><AssessmentsBannerTabs /></div>} rightSlot={bannerStats} />

      {/* Tabs Section */}
      <div className="w-full bg-white flex items-center border-b border-gray-200 sticky top-0 z-[1] overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-6 md:gap-8 px-4 md:px-6 pt-4 min-w-max">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-4 text-[15px] md:text-[16px] font-bold transition-all border-b-[3px] whitespace-nowrap ${
              activeTab === "all" ? "border-[#1E69DA] text-[#1E69DA]" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            All {allTests?.length || 0}
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-4 text-[15px] md:text-[16px] font-bold transition-all border-b-[3px] whitespace-nowrap ${
              activeTab === "active" ? "border-[#1E69DA] text-[#1E69DA]" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Active {activeCount}
          </button>
          <button
            onClick={() => setActiveTab("expired")}
            className={`pb-4 text-[15px] md:text-[16px] font-bold transition-all border-b-[3px] whitespace-nowrap ${
              activeTab === "expired" ? "border-[#1E69DA] text-[#1E69DA]" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Expired {expiredCount}
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`pb-4 text-[15px] md:text-[16px] font-bold transition-all border-b-[3px] whitespace-nowrap ${
              activeTab === "results" ? "border-[#1E69DA] text-[#1E69DA]" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Results {resultsCount}
          </button>
        </div>
      </div>

      <section className="w-full flex-1 overflow-y-auto overscroll-y-none px-4 mt-8 pb-2 [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#e2e8f0] [&::-webkit-scrollbar-thumb]:rounded-[20px] [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent">
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
                    <span className="max-w-[400px]">There are no tests to see results for. Try attempting a test to check out your results!</span>
                  </span>
                ) : activeTab === "expired" ? (
                  <span className="flex flex-col items-center gap-3">
                    <span className="text-5xl mb-2">⏳</span>
                    <span className="max-w-[400px]">No expired tests at the moment. You're all caught up!</span>
                  </span>
                ) : activeTab === "active" ? (
                  <span className="flex flex-col items-center gap-3">
                    <span className="text-5xl mb-2">🚀</span>
                    <span className="max-w-[400px]">No active tests right now. Check back later for new ones!</span>
                  </span>
                ) : (
                  <span className="flex flex-col items-center gap-3">
                    <span className="text-5xl mb-2">📭</span>
                    <span className="max-w-[400px]">No tests available right now. Check back soon!</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            filteredTests?.map((e, index) => {
              return (
                <div
                  key={e?._id}
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
                    isResultTab={activeTab === 'results'}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && filteredTests?.length > 8 && (
          <div className="flex justify-center mt-8 pb-4">
            <Pagination 
              defaultCurrent={1} 
              total={filteredTests.length} 
              pageSize={8} 
              showSizeChanger={false} 
            />
          </div>
        )}

        {/* End of list message */}
        {!loading && filteredTests?.length > 0 && !pageinfo?.hasNextPage && (
          <div style={{ textAlign: "center", paddingTop: "20px", paddingBottom: "10px", color: "#aaa", fontSize: "13px" }}>
            You&apos;ve seen all {filteredTests.length} test{filteredTests.length !== 1 ? "s" : ""}
          </div>
        )}
      </section>

      <>
        <Modal
          title="Enter Access Code To Join Test"
          open={showPopup}
          onOk={() => {
            submitCode();
            setShowPopup(false);
          }}
          onCancel={() => {
            setCodeIn("");
            setShowPopup(false);
          }}
          destroyOnHidden={true}
        >
          <div className="w-full rounded-lg bg-white">
            <div className="py-4 w-full gap-8 flex flex-col items-center justify-center">
              <input
                className="w-[82%] p-2 mx-auto rounded-lg border border-[#e5e7eb] outline-none font-semibold placeholder:text-gray-400"
                placeholder="Enter Access Code To Join Test"
                onChange={(inputValue) => setCodeIn(inputValue.target.value)}
              />
            </div>
          </div>
        </Modal>
      </>
    </div>
  );
}
