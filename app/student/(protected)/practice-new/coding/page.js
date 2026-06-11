"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import {
  fetchSubjectsByType,
  fetchPracQuestions,
} from "@/redux/slices/practiceSlice";
import { Button, Divider, Result, Spin, Tooltip, message } from "antd";
import useResponsive from "@/hooks/useResponsive";
import styles from "@/mobile_views/practice/mobilePracticeLayout.module.scss";

export default function CodingPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const currPath = usePathname();
  const searchParams = useSearchParams();
  const subjects = useSelector((s) => s.practice.subjects);
  const studentCreds = useSelector((state) => state.student.student?.data);
  const [loading, setLoading] = useState(false);
  const [loadingques, setLoadingques] = useState(false);
  const isMobile = useResponsive();

  const categoryTabs = [
    { name: "Technical", path: "/student/practice-new/technical" },
    { name: "Non-Technical", path: "/student/practice-new/nontechnical" },
    { name: "Coding", path: "/student/practice-new/coding" },
  ];

  useEffect(() => {
    setLoading(true);
    dispatch(fetchSubjectsByType("coding")).finally(() => {
      setLoading(false);
    });
  }, [dispatch]);

  const handleClick = async (subject) => {
    setLoadingques(true);

    try {
      const result = await dispatch(
        fetchPracQuestions({
          refId: subject._id,
          type: "subjectId",
          userId: studentCreds?._id,
        })
      ).unwrap();

      // Check if questions exist
      if (result && result?.data?.questionsData?.length > 0) {
        router.push(`/student/practice-new/coding/codingtest?sub=${subject?._id}`);
      } else {
        message.warning("No questions available for this subject");
      }
    } catch (error) {
      message.error("Failed to fetch questions. Please try again.");
      console.error("Error fetching questions:", error);
    } finally {
      setLoadingques(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h2>Coding Practice Page</h2>
        <Divider />
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "10px" }}>Loading subjects...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={styles.container}>
        <div className={styles.categoryTabs}>
          {categoryTabs.map((tab) => {
            const isActive = tab.path === "/student/practice-new/coding";
            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`${styles.tabBtn} ${isActive ? styles.activeTab : ""}`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
        <div className={styles.contentArea}>
          {subjects && subjects.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-6 py-2 pb-16">
              {subjects.map((subject, index) => (
                <Tooltip
                  key={subject._id || index}
                  title={subject?.title}
                  arrow
                  placement="top"
                >
                  <div className="flex items-start justify-center flex-col rounded-lg p-8 gap-[1.8rem] bg-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] hover:shadow-lg transition-shadow">
                    <p className="text-[20px] font-bold text-[#24A058] max-w-[95%] break-words overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer m-0">
                      {subject?.title || subject?.key}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-black text-[15px] font-bold m-0">Number of Questions:</p>
                      <p className="text-[#24A058] text-[15px] font-bold m-0">{subject?.totalQuestions}</p>
                    </div>
                    <Button
                      type="primary"
                      style={{ width: "8rem" }}
                      onClick={() => handleClick(subject)}
                      disabled={loadingques}
                    >
                      Start
                    </Button>
                  </div>
                </Tooltip>
              ))}
            </div>
          ) : (
            <Result
              status="404"
              title="No Subjects Found"
              subTitle="Sorry, there are no subjects available for this topic right now."
            />
          )}
        </div>
      </div>
    );
  }

  return (
    
      <div>
        <StudentPageHeader section="Practice" title="Coding Practice" />
        {subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-6 py-2 pb-16">
            {subjects.map((subject, index) => (
              <Tooltip
                key={subject._id || index}
                title={subject?.title}
                arrow
                placement="top"
              >
                <div className="flex items-start justify-center flex-col rounded-lg p-8 gap-[1.8rem] bg-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] hover:shadow-lg transition-shadow">
                  <p className="text-[20px] font-bold text-[#24A058] max-w-[95%] break-words overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer m-0">
                    {subject?.title || subject?.key}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-black text-[15px] font-bold m-0">Number of Questions:</p>
                    <p className="text-[#24A058] text-[15px] font-bold m-0">{subject?.totalQuestions}</p>
                  </div>
                  <Button
                    type="primary"
                    style={{ width: "8rem" }}
                    onClick={() => handleClick(subject)}
                    disabled={loadingques}
                  >
                    Start
                  </Button>
                </div>
              </Tooltip>
            ))}
          </div>
        ) : (
          <Result
            status="404"
            title="No Subjects Found"
            subTitle="Sorry, there are no subjects available for this topic right now."
          />
        )}
      </div>
    
  );
}
