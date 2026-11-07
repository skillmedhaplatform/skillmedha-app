"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbClock,
  TbDoorExit,
  TbSend,
  TbBulb,
  TbCircleCheck,
  TbAlertTriangle,
  TbListCheck,
  TbPlayerSkipForward,
} from "react-icons/tb";
import { PRACTICE_SAMPLE_QUESTIONS } from "./onboardingConfig";

export default function PracticeTestDemoModal({
  isOpen,
  guideType = "practice-all",
  stepIndex = 2,
}) {
  if (!isOpen) return null;

  const sample =
    PRACTICE_SAMPLE_QUESTIONS[guideType] ||
    PRACTICE_SAMPLE_QUESTIONS["practice-all"];

  // Step 2 = Option Selection (step 3 in user numbering)
  // Step 3 = Submit Answer (step 4)
  // Step 4 = Solution & Explanation (step 5)
  // Step 5 = Quit or Finish Test (step 6)
  // Step 6 = Confirm End Test (step 7)
  const isOptionStep = stepIndex === 2;
  const isSubmitStep = stepIndex === 3;
  const isSolutionVisible = stepIndex >= 4;
  const isQuitStep = stepIndex === 5;
  const isConfirmModalVisible = stepIndex === 6;

  return (
    <div
      className="fixed inset-0 z-[9988] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
      aria-label="Practice Test Interface Preview"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="w-full max-w-4xl max-h-[92vh] bg-[#F8FAFC] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/90 relative"
      >
        {/* Topbar */}
        <div className="w-full bg-[#071631] text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10">
          <div className="flex flex-col">
            <span className="text-[15px] font-bold tracking-tight text-white flex items-center gap-2">
              {sample.subject}
            </span>
            <span className="text-[11px] text-[#5694F0] font-semibold uppercase tracking-wider">
              {sample.category}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer Pill */}
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-white/95 border border-white/15">
              <TbClock className="text-sm text-yellow-300" />
              <span>{sample.timeRemaining}</span>
            </div>

            {/* Quit Test Button */}
            <button
              data-tour="practice-test-quit-button"
              type="button"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isQuitStep
                  ? "!bg-red-500 !text-white shadow-lg ring-4 ring-red-300 animate-pulse"
                  : "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
              }`}
            >
              <TbDoorExit size={15} />
              <span>Quit Test</span>
            </button>
          </div>
        </div>

        {/* Scrollable Test Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Progress Card */}
          <div className="bg-white rounded-xl p-3 sm:px-4 sm:py-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>
                  Question {sample.questionNumber} of {sample.totalQuestions}
                </span>
                <span className="text-blue-600 font-bold">In Progress</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: `${(sample.questionNumber / sample.totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100/70 shrink-0">
              <TbListCheck />
              <span>Multiple Choice</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                Question {String(sample.questionNumber).padStart(2, "0")}
              </span>
              <span className="text-xs font-medium text-slate-400">
                1 Mark • Single Choice
              </span>
            </div>

            <h3 className="text-[16px] sm:text-[17px] font-bold text-slate-900 leading-snug">
              {sample.questionText}
            </h3>

            {/* Answer Options */}
            <div
              data-tour="practice-test-options"
              className={`grid grid-cols-1 gap-2.5 pt-2 rounded-xl p-2 transition-all ${
                isOptionStep ? "ring-2 ring-blue-400 bg-blue-50/40" : ""
              }`}
            >
              {sample.options.map((opt) => {
                const isSelected = opt.id === sample.selectedOptionId;
                return (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-500"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "border border-slate-300 text-slate-500 bg-slate-50"
                      }`}
                    >
                      {opt.id}
                    </div>
                    <span className="flex-1">{opt.text}</span>
                    {isSelected && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <TbPlayerSkipForward size={14} />
                <span>Skip</span>
              </button>

              <button
                data-tour="practice-test-submit-button"
                type="button"
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-xs cursor-pointer ${
                  isSubmitStep
                    ? "!bg-[#1E69DA] shadow-lg ring-4 ring-blue-300 animate-pulse scale-[1.02]"
                    : "bg-[#1E69DA] hover:bg-[#1855b3]"
                }`}
              >
                <TbSend size={15} />
                <span>Submit Answer</span>
              </button>
            </div>
          </div>

          {/* Solution & Explanation Panel */}
          <AnimatePresence>
            {isSolutionVisible && (
              <motion.div
                data-tour="practice-test-solution"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl border-2 border-emerald-500/40 overflow-hidden shadow-xs"
              >
                <div className="bg-emerald-50/70 border-b border-emerald-100 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <TbBulb className="text-amber-500 text-base" />
                    <span>Solution Explanation</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    <TbCircleCheck /> Correct Answer
                  </span>
                </div>

                <div className="p-5 space-y-3.5">
                  <div
                    className="text-xs sm:text-sm text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sample.explanation }}
                  />

                  {sample.quickTip && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900">
                      <TbBulb className="text-amber-500 text-base shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold mb-0.5">
                          Quick Tip:
                        </strong>
                        <span className="leading-relaxed">
                          {sample.quickTip}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <TbCircleCheck size={16} />
                    <span>Correct! Response registered and graded.</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* End Test Confirmation Modal Overlay (Step 6 / Final Confirmation) */}
        <AnimatePresence>
          {isConfirmModalVisible && (
            <motion.div
              data-tour="practice-test-end-confirm-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 flex flex-col items-center text-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center">
                  <TbAlertTriangle size={26} />
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    End Practice Test?
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Are you sure you want to end this session? Your responses
                    and analytics will be saved.
                  </p>
                </div>

                {/* Score Summary */}
                <div className="w-full grid grid-cols-3 gap-2 py-2">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      Total
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {sample.totalQuestions}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      Answered
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      1
                    </span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                    <span className="block text-[10px] uppercase font-bold text-emerald-600">
                      Score
                    </span>
                    <span className="text-sm font-extrabold text-emerald-700">
                      {sample.score}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    No, Go Back
                  </button>

                  <button
                    data-tour="practice-test-end-confirm-btn"
                    type="button"
                    className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md ring-4 ring-emerald-200 animate-pulse transition-all cursor-pointer"
                  >
                    <TbCircleCheck size={14} />
                    <span>Yes, End Test</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

