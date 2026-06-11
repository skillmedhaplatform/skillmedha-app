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

import { Button, message, Modal, notification, Spin } from "antd";
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

  return (
    <div className="relative flex flex-col gap-2">
      <StudentPageHeader section="Assessment" title="Tests" />
      <div className="text-[#24A058] text-[1.8rem] font-extrabold w-full bg-white py-2 sticky top-0 z-[1]">My Tests</div>

      <section className="w-full overflow-y-hidden [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-[#f0f0f0] [&::-webkit-scrollbar-thumb]:rounded-[20px] [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-[rgba(255,255,255,0.5)]">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-[0.7rem] overflow-hidden 2xl:grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : allTests?.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", width: "100%", color: "#888" }}>
              <p style={{ fontSize: "16px" }}>No tests available for you right now.</p>
            </div>
          ) : (
            allTests?.map((e, index) => {
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

        {/* Load More Button */}
        {!loading && pageinfo?.hasNextPage && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={fetchMore}
              loading={loadingMore}
              type="primary"
              size="large"
              style={{ minWidth: 140 }}
            >
              {loadingMore ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}

        {/* End of list message */}
        {!loading && allTests?.length > 0 && !pageinfo?.hasNextPage && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#aaa", fontSize: "13px" }}>
            You&apos;ve seen all {allTests.length} test{allTests.length !== 1 ? "s" : ""}
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
