"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { fetchPracQuestions } from "@/redux/slices/practiceSlice";
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Button, Divider, Result, message } from "antd";
import CodingPage from "@/universalUtils/codeEditor/page";
import useResponsive from "@/hooks/useResponsive";
import MobileCodingPlayer from "@/mobile_views/practice/MobileCodingPlayer";

function CodingComponent({ questions, onRestart }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1)
      setCurrentIndex((prev) => prev + 1);
  };

  const handleFinish = () => {
    setIsCompleted(true);
  };

  const handleStartAgain = () => {
    setCurrentIndex(0);
    setIsCompleted(false);
    if (onRestart) onRestart();
  };

  if (isCompleted) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <Result
          icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          title="Practice Session Completed!"
          subTitle={`You have completed all ${questions.length} coding questions. Great job on your practice session!`}
          extra={[
            <Button type="primary" key="restart" onClick={handleStartAgain}>
              Start Again
            </Button>,
            <Button key="home" onClick={() => window.history.back()}>
              Go Back
            </Button>,
          ]}
        />
      </div>
    );
  }

  const isMobile = useResponsive();

  if (isMobile) {
    return (
      <div className="flex-1 h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <MobileCodingPlayer questionData={questions?.[currentIndex]} />
        </div>
        <Divider className="!my-2" />
        <div className="text-center w-full py-2 px-4 flex items-center justify-between gap-4">
          <span className="text-[#666] text-[13px]">
            {currentIndex + 1} / {questions.length}
          </span>

          <div className="flex gap-2">
            <Button
              type="default"
              size="middle"
              icon={<LeftOutlined />}
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              Prev
            </Button>

            {currentIndex === questions.length - 1 ? (
              <Button
                type="primary"
                size="middle"
                icon={<CheckCircleOutlined />}
                onClick={handleFinish}
                className="!bg-[#52c41a] !border-[#52c41a]"
              >
                Finish
              </Button>
            ) : (
              <Button
                type="primary"
                size="middle"
                icon={<RightOutlined />}
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#F8FAFC]">
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodingPage questionData={questions?.[currentIndex]} />
      </div>
      <Divider className="!my-2" />
      <div className="text-center w-full py-3 px-6 flex items-center justify-between gap-4 bg-white border-t border-[#e2e8f0]">
        <span className="text-[#64748B] text-[14px] font-medium">
          Question {currentIndex + 1} of {questions.length}
        </span>

        <div className="flex gap-4">
          <Button
            type="default"
            icon={<LeftOutlined />}
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="!rounded-lg !border-[#1E69DA] !text-[#1E69DA] hover:!bg-[#1E69DA]/10 !h-10 !px-5 !font-semibold transition-all duration-200"
          >
            Previous Question
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleFinish}
              className="!rounded-lg !bg-gradient-to-r !from-[#24A058] !to-[#34d399] !border-none hover:!opacity-90 !h-10 !px-5 !font-semibold transition-all duration-200 shadow-md"
            >
              Finish Practice
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<RightOutlined />}
              onClick={handleNext}
              className="!rounded-lg !bg-gradient-to-r !from-[#1E69DA] !to-[#5694F0] !border-none hover:!opacity-95 !h-10 !px-5 !font-semibold transition-all duration-200 shadow-md"
            >
              Next Question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const studentCreds = useSelector((state) => state.student.student?.data);
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pracQuestions = useSelector(
    (s) => s.practice.pracQuestions?.questionsData || []
  );
  const subjectId = searchParams.get("sub");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchQuestions = () => {
    if (!subjectId || !studentCreds?._id) return;

    dispatch(
      fetchPracQuestions({
        refId: subjectId,
        type: "subjectId",
        userId: studentCreds._id,
      })
    )
      .unwrap()
      .then((res) => {
        console.log(res);

        if (
          !res?.data?.questionsData ||
          res?.data?.questionsData.length === 0
        ) {
          message.warning("No practice questions found for this subject.");
          router.replace("/student/practice-new/coding");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch questions:", err);
        message.error("Something went wrong while fetching questions.");
        router.replace("/student/practice-new/coding");
      });
  };

  useEffect(() => {
    fetchQuestions();
  }, [subjectId, studentCreds?._id, dispatch, router, refreshTrigger]);

  const handleRestart = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <StudentPageHeader section="Practice" title="Coding Test" style={{ borderRadius: 0 }} />
      {pracQuestions.length > 0 && (
        <CodingComponent
          questions={pracQuestions}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
