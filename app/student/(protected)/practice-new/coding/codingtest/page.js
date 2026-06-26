"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchPracQuestions } from "@/redux/slices/practiceSlice";
import {
  CheckCircleOutlined,
} from "@ant-design/icons";
import { TbClock, TbPlayerStop, TbChevronLeft, TbChevronRight, TbAlertTriangle, TbCircleX, TbCircleCheck } from "react-icons/tb";
import { Button, Result, message, Modal } from "antd";
import CodingPage from "@/universalUtils/codeEditor/page";
import useResponsive from "@/hooks/useResponsive";
import MobileCodingPlayer from "@/mobile_views/practice/MobileCodingPlayer";
import pageStyles from "@/universalUtils/codeEditor/page.module.scss";
import testStyles from "../../test/testui.module.scss";

function CodingComponent({ questions, onRestart }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1)
      setCurrentIndex((prev) => prev + 1);
  };

  const handleFinish = () => {
    window.location.href = "/student/practice-new/coding";
  };



  const isMobile = useResponsive();

  if (isMobile) {
    return (
      <div className="flex-1 h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <MobileCodingPlayer questionData={questions?.[currentIndex]} />
        </div>
        <div className="text-center w-full py-2 px-4 flex items-center justify-between gap-4">
          <span className="text-[#666] text-[13px]">
            {currentIndex + 1} / {questions.length}
          </span>
          <div className="flex gap-2">
            <Button size="middle" icon={<TbChevronLeft />} onClick={handlePrev} disabled={currentIndex === 0}>Prev</Button>
            {currentIndex === questions.length - 1 ? (
              <Button type="primary" size="middle" onClick={handleFinish} className="!bg-[#52c41a]">Finish</Button>
            ) : (
              <Button type="primary" size="middle" icon={<TbChevronRight />} onClick={handleNext}>Next</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageStyles.main}>
      {/* Topbar */}
      <div className={pageStyles.topbar}>
        <div className={pageStyles.topbarLeft}>
          <div className={pageStyles.topicTitle}>Practice Test</div>
          <div className={pageStyles.topicBadge}>Coding</div>
          <div className={pageStyles.difficulty}>Practice</div>
          
          <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
            <Button type="text" size="small" icon={<TbChevronLeft />} onClick={handlePrev} disabled={currentIndex === 0} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text2)', alignSelf: 'center' }}>
              {currentIndex + 1} / {questions.length}
            </span>
            <Button type="text" size="small" icon={<TbChevronRight />} onClick={handleNext} disabled={currentIndex === questions.length - 1} />
          </div>
        </div>
        <div className={pageStyles.topbarRight}>
          <button className={pageStyles.quitBtn} onClick={() => setShowEndModal(true)}>
            <TbPlayerStop size={14} /> End Practice Test
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <CodingPage questionData={questions?.[currentIndex]} />

      <Modal
        open={showEndModal}
        footer={null}
        closable={false}
        centered
        width={400}
        wrapClassName={testStyles.endTestModal}
      >
        <div className={testStyles.modalIconWrap}>
          <TbAlertTriangle />
        </div>
        <div className={testStyles.modalTitle}>
          Are you sure you want to end this test?
        </div>
        <div className={testStyles.modalDesc}>
          You are about to end the coding practice session. Once submitted, you cannot change your answers. This action cannot be undone.
        </div>
        <div className={testStyles.modalStats}>
          <div className={`${testStyles.statBox} ${testStyles.answered}`}>
            <div className={testStyles.statNum}>{currentIndex + 1}</div>
            <div className={testStyles.statLabel}>Answered</div>
          </div>
          <div className={`${testStyles.statBox} ${testStyles.unanswered}`}>
            <div className={testStyles.statNum}>{questions.length - (currentIndex + 1)}</div>
            <div className={testStyles.statLabel}>Unanswered</div>
          </div>
        </div>
        <div className={testStyles.modalActions}>
          <button className={testStyles.cancelBtn} onClick={() => setShowEndModal(false)}>
            <TbCircleX /> No, Go Back
          </button>
          <button className={testStyles.confirmBtn} onClick={() => {
            setShowEndModal(false);
            handleFinish();
          }}>
            <TbCircleCheck /> Yes, End Test
          </button>
        </div>
      </Modal>
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
    <div className={pageStyles.app} style={{ width: '100%', borderRadius: 0 }}>
      {pracQuestions.length > 0 && (
        <CodingComponent
          questions={pracQuestions}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
