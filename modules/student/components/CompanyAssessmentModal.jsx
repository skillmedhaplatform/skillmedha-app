"use client";

import React, { useEffect, useState } from "react";
import { Modal, Button, Dropdown, Spin } from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  DownOutlined,
  InfoCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { restUrl } from "@/config/urls";

export default function CompanyAssessmentModal({
  open,
  test,
  onClose,
  studentCreds,
  router,
  initialState = "INITIAL",
}) {
  const [modalState, setModalState] = useState(initialState || "INITIAL"); // INITIAL, RESULTS
  const [pastAttempts, setPastAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [fullScreenResultIdx, setFullScreenResultIdx] = useState(null);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("All");

  useEffect(() => {
    const testId = test?._id || test?.id;
    if (open && testId) {
      setModalState(initialState || "INITIAL");
      setPastAttempts([]);
      setFullScreenResultIdx(null);
      setSelectedSectionFilter("All");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || sessionStorage.getItem("token") || ""
          : "";
      if (token) {
        setLoadingAttempts(true);
        fetch(`${restUrl}/practice/top-scores/${testId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && data.data) {
              setPastAttempts(data.data);
            }
          })
          .catch((e) => console.error(e))
          .finally(() => {
            setLoadingAttempts(false);
          });
      }
    }
  }, [open, test?._id, test?.id, initialState]);

  if (!test) return null;

  const testTitle = test.title || test.name || "Assessment";

  const handleStartTestClick = () => {
    const studentName = studentCreds?.userName || studentCreds?.fullName || "Student";
    const studentEmail = studentCreds?.email || "student@example.com";
    const testId = test._id || test.id;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "current_mock_user",
        JSON.stringify({ name: studentName, email: studentEmail })
      );
      sessionStorage.removeItem(`active_test_${testId}`);
    }
    const duration = test.timeLimit || test.timeMinutes || 60;
    router.push(`/student/practice-new/company-wise/${testId}?duration=${duration}`);
  };

  const handleClose = () => {
    setModalState("INITIAL");
    setFullScreenResultIdx(null);
    onClose?.();
  };

  return (
    <>
      <Modal
        open={open && fullScreenResultIdx === null}
        onCancel={handleClose}
        footer={null}
        closable={true}
        width={modalState === "RESULTS" ? 800 : 650}
        wrapClassName="backdrop-blur-sm"
        centered
        destroyOnClose
      >
        {modalState === "INITIAL" && (
          <div className="flex flex-col gap-6 py-4 px-2">
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
              {testTitle} Assessment
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Start Test Card */}
              <div className="flex flex-col rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 bg-white">
                <div className="bg-[#EAB308] p-6">
                  <h3 className="text-white font-bold text-xl m-0">Start Test</h3>
                </div>
                <div className="p-6 flex flex-col gap-5 flex-1">
                  <p className="text-slate-600 font-medium text-sm m-0 leading-relaxed min-h-[40px]">
                    Begin your mock assessment to evaluate your skills with our curated test pattern.
                  </p>
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                        <QuestionCircleOutlined className="text-xs" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {test.questionCount || 0} Questions
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                        <ClockCircleOutlined className="text-xs" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {test.timeLimit || 0} Minutes
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleStartTestClick}
                    className="mt-auto w-full py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl transition-colors cursor-pointer border-none"
                  >
                    Start Test
                  </button>
                </div>
              </div>

              {/* View Result Card */}
              <div className="flex flex-col rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 bg-white">
                <div className="bg-[#EF4444] p-6">
                  <h3 className="text-white font-bold text-xl m-0">View Results</h3>
                </div>
                <div className="p-6 flex flex-col gap-5 flex-1 relative">
                  <p className="text-slate-600 font-medium text-sm m-0 leading-relaxed min-h-[40px]">
                    Review your past performance and check detailed explanations for your answers.
                  </p>
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                        <CheckCircleOutlined className="text-xs" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {pastAttempts.length} Attempts
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => (pastAttempts.length > 0 ? setModalState("RESULTS") : null)}
                    disabled={pastAttempts.length === 0}
                    className="mt-auto w-full py-3 bg-[#0F172A] hover:bg-[#1E293B] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors cursor-pointer border-none"
                  >
                    {pastAttempts.length > 0 ? "View Results" : "No Attempts Yet"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {modalState === "RESULTS" && (
          <div className="flex flex-col py-4 h-[600px] overflow-hidden">
            <div className="flex items-center gap-3 mb-6 shrink-0">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => {
                  if (initialState === "RESULTS") {
                    handleClose();
                  } else {
                    setModalState("INITIAL");
                  }
                }}
              />
              <h2 className="text-xl font-bold text-slate-800 m-0">{testTitle} - Past Results</h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6">
              {loadingAttempts ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Spin size="default" />
                  <p className="mt-3 text-sm text-slate-400 font-medium">Loading attempts...</p>
                </div>
              ) : pastAttempts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <p className="font-semibold text-base">No attempts found for this test.</p>
                </div>
              ) : (
                <>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-[-8px]">
                    Top 3 Attempts
                  </div>
                  {pastAttempts.slice(0, 3).map((attempt, arrIdx) => {
                    const originalIdx = arrIdx;
                    const totalQuestions = attempt.qaPairs?.length || 0;
                    const correctCount =
                      attempt.qaPairs?.filter((qa) => qa.isCorrect).length || 0;
                    const percentage = totalQuestions
                      ? Math.round((correctCount / totalQuestions) * 100)
                      : 0;

                    return (
                      <div
                        key={attempt.id || arrIdx}
                        className="shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:border-indigo-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                      >
                        <div
                          className="px-5 py-5 cursor-pointer flex items-center justify-between transition-colors bg-white hover:bg-indigo-50/30"
                          onClick={() => setFullScreenResultIdx(originalIdx)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-inner">
                              {originalIdx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-lg">
                                Attempt {originalIdx + 1}
                              </div>
                              <div className="text-sm text-slate-500 font-medium">
                                {new Date(attempt.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-2xl font-black text-slate-800 tracking-tight">
                                {correctCount}{" "}
                                <span className="text-sm text-slate-400 font-semibold">
                                  / {totalQuestions}
                                </span>
                              </div>
                              <div
                                className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${
                                  percentage >= 70
                                    ? "text-emerald-500"
                                    : percentage >= 40
                                    ? "text-amber-500"
                                    : "text-red-500"
                                }`}
                              >
                                {percentage}% Score
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:translate-x-1">
                              <ArrowLeftOutlined className="text-[16px] rotate-180" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {pastAttempts.length > 3 && (
                    <>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 mt-4 mb-[-8px]">
                        Other Attempts
                      </div>
                      {pastAttempts.slice(3).map((attempt, arrIdx) => {
                        const originalIdx = arrIdx + 3;
                        const totalQuestions = attempt.qaPairs?.length || 0;
                        const correctCount =
                          attempt.qaPairs?.filter((qa) => qa.isCorrect).length || 0;
                        const percentage = totalQuestions
                          ? Math.round((correctCount / totalQuestions) * 100)
                          : 0;

                        return (
                          <div
                            key={attempt.id || arrIdx}
                            className="shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:border-slate-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
                          >
                            <div
                              className="px-5 py-5 cursor-pointer flex items-center justify-between transition-colors bg-white hover:bg-slate-50"
                              onClick={() => setFullScreenResultIdx(originalIdx)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg shadow-inner">
                                  {originalIdx + 1}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 text-lg">
                                    Attempt {originalIdx + 1}
                                  </div>
                                  <div className="text-sm text-slate-500 font-medium">
                                    {new Date(attempt.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <div className="text-2xl font-black text-slate-800 tracking-tight">
                                    {correctCount}{" "}
                                    <span className="text-sm text-slate-400 font-semibold">
                                      / {totalQuestions}
                                    </span>
                                  </div>
                                  <div
                                    className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${
                                      percentage >= 70
                                        ? "text-emerald-500"
                                        : percentage >= 40
                                        ? "text-amber-500"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {percentage}% Score
                                  </div>
                                </div>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 transition-transform duration-300 group-hover:translate-x-1">
                                  <ArrowLeftOutlined className="text-[16px] rotate-180" />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Full Screen Results Overlay */}
      {open && fullScreenResultIdx !== null && pastAttempts[fullScreenResultIdx] && (() => {
        const attempt = pastAttempts[fullScreenResultIdx];
        const qaPairs = attempt.qaPairs || [];
        const totalQuestions = qaPairs.length;
        const correctCount = qaPairs.filter((qa) => qa.isCorrect).length;
        const percentage = totalQuestions
          ? Math.round((correctCount / totalQuestions) * 100)
          : 0;

        const sectionStats = qaPairs.reduce((acc, qa) => {
          let sectionName = qa.section;
          if (!sectionName && qa.raw) {
            const rawStr = qa.raw.sectionName || qa.raw.subjectName || "General";
            sectionName = rawStr.split(" - ")[0].trim();
          }
          sectionName = sectionName || "General";

          if (!acc[sectionName])
            acc[sectionName] = {
              total: 0,
              correct: 0,
              wrong: 0,
              unanswered: 0,
              qaList: [],
            };

          acc[sectionName].total += 1;
          acc[sectionName].qaList.push(qa);

          const studentAnsText =
            typeof qa.studentAnswer === "object" && qa.studentAnswer !== null
              ? JSON.stringify(qa.studentAnswer)
              : qa.studentAnswer || "Not Answered";
          const isUnanswered = studentAnsText === "Not Answered" || !qa.studentAnswer;

          if (qa.isCorrect) acc[sectionName].correct += 1;
          else if (isUnanswered) acc[sectionName].unanswered += 1;
          else acc[sectionName].wrong += 1;

          return acc;
        }, {});

        const allSections = Object.keys(sectionStats);

        const overallStats = {
          total: totalQuestions,
          correct: correctCount,
          wrong: qaPairs.filter((qa) => {
            const studentAnsText =
              typeof qa.studentAnswer === "object" && qa.studentAnswer !== null
                ? JSON.stringify(qa.studentAnswer)
                : qa.studentAnswer || "Not Answered";
            return !qa.isCorrect && studentAnsText !== "Not Answered" && qa.studentAnswer;
          }).length,
          unanswered: qaPairs.filter((qa) => {
            const studentAnsText =
              typeof qa.studentAnswer === "object" && qa.studentAnswer !== null
                ? JSON.stringify(qa.studentAnswer)
                : qa.studentAnswer || "Not Answered";
            return studentAnsText === "Not Answered" || !qa.studentAnswer;
          }).length,
          qaList: qaPairs,
        };

        const displayStats =
          selectedSectionFilter === "All"
            ? overallStats
            : sectionStats[selectedSectionFilter] || overallStats;

        return (
          <div className="fixed inset-0 z-[2000] bg-slate-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-sm shrink-0 z-20 relative">
              {/* Left: Title & Back */}
              <div className="flex items-center gap-4 shrink-0">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => {
                    setFullScreenResultIdx(null);
                    setModalState("RESULTS");
                    setSelectedSectionFilter("All");
                  }}
                  className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full w-10 h-10 border-none shadow-inner shrink-0"
                />
                <div>
                  <h1 className="text-xl font-black text-slate-800 m-0 tracking-tight flex items-center gap-2 border-none pb-0">
                    {testTitle}
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest m-0 mt-0.5 whitespace-nowrap">
                    Attempt {fullScreenResultIdx + 1} &bull;{" "}
                    {new Date(attempt.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Center: Tabs & Category Stats */}
              <div className="flex flex-col xl:flex-row items-center gap-4 xl:gap-8 flex-1 justify-center px-4 w-full xl:w-auto">
                {allSections.length > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Dropdown
                      menu={{
                        items: [
                          { key: "All", label: "All Sections" },
                          ...allSections.map((sec) => ({ key: sec, label: sec })),
                        ],
                        onClick: (e) => setSelectedSectionFilter(e.key),
                      }}
                      trigger={["hover"]}
                      placement="bottom"
                    >
                      <button className="px-5 py-2 rounded-full font-bold text-[13px] bg-indigo-600 text-white flex items-center gap-2 shadow-sm transition-all hover:bg-indigo-700 cursor-pointer border-none outline-none whitespace-nowrap">
                        {selectedSectionFilter === "All" ? "All Sections" : selectedSectionFilter}{" "}
                        <DownOutlined className="text-[10px]" />
                      </button>
                    </Dropdown>
                  </div>
                )}

                <div className="hidden xl:block w-px h-8 bg-slate-200 shrink-0"></div>

                <div className="flex items-center gap-5 shrink-0">
                  <div className="flex flex-col min-w-fit items-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">
                      Total Questions
                    </div>
                    <div className="text-[20px] font-black text-slate-800 leading-none">
                      {displayStats.total}
                    </div>
                  </div>
                  <div className="w-px h-6 bg-slate-200 shrink-0"></div>
                  <div className="flex flex-col min-w-fit items-center">
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5 whitespace-nowrap">
                      Correct Answers
                    </div>
                    <div className="text-[20px] font-black text-emerald-600 leading-none">
                      {displayStats.correct}
                    </div>
                  </div>
                  <div className="w-px h-6 bg-slate-200 shrink-0"></div>
                  <div className="flex flex-col min-w-fit items-center">
                    <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-0.5 whitespace-nowrap">
                      Wrong Answers
                    </div>
                    <div className="text-[20px] font-black text-rose-600 leading-none">
                      {displayStats.wrong}
                    </div>
                  </div>
                  <div className="w-px h-6 bg-slate-200 shrink-0"></div>
                  <div className="flex flex-col min-w-fit items-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">
                      Unanswered
                    </div>
                    <div className="text-[20px] font-black text-slate-600 leading-none">
                      {displayStats.unanswered}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Candidate & Score */}
              <div className="flex items-center gap-6 shrink-0 justify-end xl:w-auto w-full">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      Candidate
                    </div>
                    <div className="text-[15px] font-bold text-slate-800">
                      {attempt.user?.name || studentCreds?.userName || "Student"}
                    </div>
                  </div>
                </div>
                <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-5 py-2 rounded-xl shadow-inner">
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-800 tracking-tight">
                      {correctCount}{" "}
                      <span className="text-sm text-slate-400 font-semibold">
                        / {totalQuestions}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      percentage >= 70
                        ? "bg-emerald-100 text-emerald-700"
                        : percentage >= 40
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {percentage}% Score
                  </div>
                </div>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={handleClose}
                  className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full w-10 h-10 border-none shadow-inner shrink-0"
                  title="Close Results"
                />
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 w-full relative bg-slate-50">
              <div className="max-w-[90rem] mx-auto flex flex-col gap-8 pb-20">
                <div className="flex flex-col gap-8">
                  {displayStats.qaList.map((qa, qIdx) => {
                    let parsedActualAnswer = qa.actualAnswer;
                    if (
                      typeof parsedActualAnswer === "string" &&
                      parsedActualAnswer.startsWith("{")
                    ) {
                      try {
                        parsedActualAnswer = JSON.parse(parsedActualAnswer);
                      } catch (e) {}
                    }

                    let actualAnsText =
                      typeof qa.actualAnswer === "object" && qa.actualAnswer !== null
                        ? JSON.stringify(qa.actualAnswer)
                        : qa.actualAnswer || "N/A";
                    let actualExplanation = qa.explanation;

                    if (typeof parsedActualAnswer === "object" && parsedActualAnswer !== null) {
                      if (parsedActualAnswer.multipleChoice) {
                        actualAnsText = Object.keys(parsedActualAnswer.multipleChoice)
                          .filter((k) => parsedActualAnswer.multipleChoice[k])
                          .join(", ");
                      } else if (parsedActualAnswer.singleChoice) {
                        if (typeof parsedActualAnswer.singleChoice === "object") {
                          actualAnsText = Object.keys(parsedActualAnswer.singleChoice)
                            .filter((k) => parsedActualAnswer.singleChoice[k])
                            .join(", ");
                        } else {
                          actualAnsText = parsedActualAnswer.singleChoice;
                        }
                      } else if (parsedActualAnswer.answer) {
                        actualAnsText = parsedActualAnswer.answer;
                      }
                      if (
                        typeof actualExplanation === "string" &&
                        actualExplanation.trim() === ""
                      )
                        actualExplanation = null;
                      if (!actualExplanation && parsedActualAnswer.explanation) {
                        actualExplanation = parsedActualAnswer.explanation;
                      }
                    }

                    const studentAnsText =
                      typeof qa.studentAnswer === "object" && qa.studentAnswer !== null
                        ? JSON.stringify(qa.studentAnswer)
                        : qa.studentAnswer || "Not Answered";
                    const isUnanswered =
                      studentAnsText === "Not Answered" || !qa.studentAnswer;

                    let derivedOptions = qa.options || [];
                    if (!derivedOptions || derivedOptions.length === 0) {
                      if (qa.raw?.options && qa.raw.options.length > 0)
                        derivedOptions = qa.raw.options;
                      else if (qa.raw?.content?.options && qa.raw.content.options.length > 0)
                        derivedOptions = qa.raw.content.options;
                      else if (qa.question?.options && qa.question.options.length > 0)
                        derivedOptions = qa.question.options;
                    }
                    if (
                      (!derivedOptions || derivedOptions.length === 0) &&
                      typeof parsedActualAnswer === "object" &&
                      parsedActualAnswer !== null
                    ) {
                      if (parsedActualAnswer.multipleChoice) {
                        derivedOptions = Object.keys(parsedActualAnswer.multipleChoice);
                      } else if (
                        parsedActualAnswer.singleChoice &&
                        typeof parsedActualAnswer.singleChoice === "object"
                      ) {
                        derivedOptions = Object.keys(parsedActualAnswer.singleChoice);
                      }
                    }

                    return (
                      <div
                        key={qIdx}
                        className="relative flex flex-col gap-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
                      >
                        <div
                          className={`absolute top-0 left-0 w-1.5 h-full ${
                            isUnanswered
                              ? "bg-slate-300"
                              : qa.isCorrect
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        ></div>

                        <div className="flex items-start gap-6">
                          <div
                            className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${
                              isUnanswered
                                ? "bg-slate-100 text-slate-500 border border-slate-200"
                                : qa.isCorrect
                                ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                                : "bg-rose-100 text-rose-600 border border-rose-200"
                            }`}
                          >
                            {qIdx + 1}
                          </div>
                          <div className="flex-1 w-full overflow-hidden">
                            <div className="font-semibold text-lg text-slate-800 leading-relaxed mb-6 pt-1">
                              <span
                                dangerouslySetInnerHTML={{
                                  __html:
                                    typeof qa.question === "string"
                                      ? qa.question
                                      : qa.question?.text || JSON.stringify(qa.question),
                                }}
                              />
                            </div>

                            {derivedOptions && derivedOptions.length > 0 && (
                              <div className="flex flex-col gap-3 mb-6">
                                {derivedOptions.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-500 shrink-0">
                                      {String.fromCharCode(65 + oIdx)}
                                    </div>
                                    <span className="font-medium text-[16px] text-slate-700 pt-1">
                                      {opt}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-5">
                              <div className="flex-1 bg-slate-50 p-6 rounded-xl border border-slate-200/60 relative overflow-hidden shadow-sm">
                                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                                  Your Answer
                                </span>
                                <span
                                  className={`font-semibold text-lg block ${
                                    isUnanswered
                                      ? "text-slate-500 italic"
                                      : qa.isCorrect
                                      ? "text-emerald-600"
                                      : "text-rose-500"
                                  }`}
                                >
                                  {studentAnsText}
                                </span>
                              </div>
                              <div className="flex-1 bg-indigo-50/50 p-6 rounded-xl border border-indigo-100/60 relative overflow-hidden shadow-sm">
                                <span className="text-[12px] font-bold text-indigo-400 uppercase tracking-widest block mb-3">
                                  Correct Answer
                                </span>
                                <span className="font-semibold text-indigo-700 text-lg block">
                                  {actualAnsText}
                                </span>
                              </div>
                            </div>

                            {actualExplanation && (
                              <div className="mt-8 bg-amber-50/50 p-6 rounded-xl border border-amber-100/60 text-amber-900 text-[15px] shadow-sm">
                                <span className="font-bold block mb-3 text-amber-700 flex items-center gap-2 uppercase tracking-widest text-[12px]">
                                  <InfoCircleOutlined className="text-[16px]" /> Explanation
                                </span>
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      typeof actualExplanation === "string"
                                        ? actualExplanation
                                        : actualExplanation?.explanation ||
                                          JSON.stringify(actualExplanation),
                                  }}
                                  className="leading-relaxed block text-amber-800/90"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
