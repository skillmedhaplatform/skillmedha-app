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

import { Button, message, Modal, notification, Spin, Pagination } from "antd";
import { getLstorage, getSstorage } from "@/universalUtils/windowMW";
import { formVals } from "@/redux/slices/assessmentsSlice/userForm";
import CardSkeleton from "./reusable_comp/cardSkeleton";
import { getStudent } from "@/redux/slices/student";

const PAGE_LIMIT = 10;

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
          (progress) => progress.testId == SingleTest._id,
        )?.length;

        const totalAttemps = SingleTest?.access?.attemptsPerRespondent;

        if (studentAttemptedLength > totalAttemps) {
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
                    (progress) => progress.testId == SingleTest?._id,
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

  // Filter tests based on tab
  const filteredTests = allTests?.filter((test) => {
    const status = test?.status?.toLowerCase();
    if (activeTab === "all") return true;
    if (activeTab === "active") return status === "active";
    if (activeTab === "expired") return status === "expired" || status === "completed";
    return true;
  });

  const activeCount = allTests?.filter(t => t?.status?.toLowerCase() === "active").length || 0;
  const expiredCount = allTests?.filter(t => t?.status?.toLowerCase() === "expired" || t?.status?.toLowerCase() === "completed").length || 0;

  const bannerStats = (
    <div className="flex items-center gap-8 pr-4">
      <div className="flex flex-col items-center">
        <span className="text-[32px] font-extrabold leading-none text-white">{allTests?.length || 0}</span>
        <span className="text-[14px] text-white/70 font-semibold tracking-wide">Total tests</span>
      </div>
      <div className="w-[1px] h-12 bg-white/20"></div>
      <div className="flex flex-col items-center">
        <span className="text-[32px] font-extrabold leading-none text-white">{activeCount}</span>
        <span className="text-[14px] text-white/70 font-semibold tracking-wide">Active</span>
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col bg-white h-screen overflow-hidden">
      <StudentPageHeader title="Tests" rightSlot={bannerStats} />

      {/* Tabs Section */}
      <div className="w-full bg-[#F1F5F9] flex items-center border-b border-gray-200 sticky top-0 z-[1]">
        <div className="flex gap-8 px-6 pt-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 text-[14px] font-bold transition-all border-b-[3px] ${
              activeTab === "all" ? "border-[#1E69DA] text-[#1E69DA]" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            All {allTests?.length || 0}
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 text-[14px] font-bold transition-all border-b-[3px] ${
              activeTab === "active" ? "border-[#1E69DA] text-[#1E69DA]" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Active {activeCount}
          </button>
          <button
            onClick={() => setActiveTab("expired")}
            className={`pb-3 text-[14px] font-bold transition-all border-b-[3px] ${
              activeTab === "expired" ? "border-[#1E69DA] text-[#1E69DA]" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Expired {expiredCount}
          </button>
        </div>
      </div>

      <section className="w-full flex-1 overflow-y-auto px-4 mt-4 pb-12 [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#e2e8f0] [&::-webkit-scrollbar-thumb]:rounded-[20px] [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-hidden">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : allTests?.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", width: "100%", color: "#888" }}>
              <p style={{ fontSize: "16px" }}>No tests available in this category right now.</p>
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
          <div style={{ textAlign: "center", padding: "20px 0", color: "#aaa", fontSize: "13px" }}>
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
