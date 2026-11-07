"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  TbClock,
  TbArrowLeft,
  TbArrowRight,
  TbCheck,
  TbAlertCircle,
  TbChecklist,
  TbCircleCheck,
  TbSend,
  TbFlag,
  TbTrash,
  TbInfoCircle,
  TbBuildingSkyscraper,
  TbAward,
  TbLayoutDashboard,
} from "react-icons/tb";

export default function CompanyTestDemoModal({
  isOpen,
  stepIndex = 2,
}) {
  if (!isOpen) return null;

  // stepIndex mapping:
  // stepIndex 2 = Category Selection (Step 3 in tour)
  // stepIndex 3 = Questions and Answer Selection (Step 4 in tour)
  // stepIndex 4 = Submit Test Confirmation (Step 5 in tour)
  // stepIndex 5 = Results and Dashboard Navigation (Step 6 in tour)
  const isCategoryStep = stepIndex === 2;
  const isQuestionStep = stepIndex === 3;
  const isSubmitStep = stepIndex === 4;
  const isResultsStep = stepIndex === 5;

  return (
    <div
      className="fixed inset-0 z-[9988] flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 backdrop-blur-sm pointer-events-auto"
      aria-label="Company-Wise Practice Test Preview"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="w-full max-w-6xl h-[92vh] max-h-[92vh] bg-[#F8FAFC] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/90 relative"
      >
        {/* Top Navbar */}
        <div className="w-full bg-[#071631] text-white px-5 py-3 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <TbBuildingSkyscraper size={20} />
            </div>
            <div>
              <div className="text-[14px] font-bold tracking-tight text-white flex items-center gap-2">
                TCS National Qualifier Assessment
              </div>
              <span className="text-[11px] text-slate-300">
                Pattern: Cognitive Skills + Technical Drive
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
              <TbClock className="text-blue-300 text-base" />
              <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">
                  Time Left
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  01:42:18
                </span>
              </div>
            </div>

            <button
              type="button"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isSubmitStep
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-red-500/80 hover:bg-red-500 text-white"
              }`}
            >
              <TbSend size={14} />
              <span>Submit Test</span>
            </button>
          </div>
        </div>

        {/* Dynamic Body: Test-Taking Interface (Steps 3-5) OR Results View (Step 6) */}
        {!isResultsStep ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-[#EFF5FB] relative">
            {/* LEFT / CENTER: Question & MCQ Interface */}
            <div
              data-tour={isQuestionStep ? "company-question-section" : undefined}
              className={`flex-1 flex flex-col bg-white overflow-y-auto transition-all ${
                isQuestionStep
                  ? "ring-2 ring-blue-500/80 shadow-lg"
                  : ""
              }`}
            >
              <div className="flex-1 w-full p-6 sm:p-8 flex flex-col">
                {/* Question Progress Header */}
                <div className="flex flex-col gap-2.5 mb-6">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-blue-600">
                      Question 1 of 30
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold border border-blue-100 text-[11px]">
                      Quantitative Aptitude
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: "3.3%" }}
                    />
                  </div>
                </div>

                {/* Question Statement */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-6">
                  1. A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?
                </h3>

                {/* Options List */}
                <div className="flex flex-col gap-3 mb-6">
                  {[
                    { key: "A", text: "120 metres", selected: false },
                    { key: "B", text: "150 metres", selected: true },
                    { key: "C", text: "175 metres", selected: false },
                    { key: "D", text: "180 metres", selected: false },
                  ].map((opt) => (
                    <div
                      key={opt.key}
                      className={`flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        opt.selected
                          ? "border-blue-600 bg-blue-50/50 shadow-xs"
                          : "border-slate-100 bg-white hover:border-slate-200"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          opt.selected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {opt.key}
                      </div>
                      <span className="text-sm font-semibold text-slate-800 flex-1">
                        {opt.text}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          opt.selected
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-300"
                        }`}
                      >
                        {opt.selected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Test Navigation Bar */}
              <div className="h-16 bg-white border-t border-slate-200/90 flex items-center justify-between px-6 shrink-0 shadow-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 border border-slate-200"
                  >
                    <TbInfoCircle size={14} />
                    <span className="hidden sm:inline">Report</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 border border-slate-200"
                  >
                    <TbTrash size={14} />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 border border-slate-200"
                  >
                    <TbFlag size={14} />
                    <span className="hidden sm:inline">Mark Review</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200 cursor-not-allowed"
                  >
                    <TbArrowLeft size={14} />
                    <span>Previous</span>
                  </button>

                  <button
                    data-tour="company-save-next-button"
                    type="button"
                    className={`flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isQuestionStep
                        ? "!bg-blue-600 !text-white ring-4 ring-blue-300 animate-pulse scale-[1.02]"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    <span>Save &amp; Next</span>
                    <TbArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: Category Selection & Question Palette */}
            <div className="w-full md:w-[320px] bg-white border-l border-slate-200/90 flex flex-col shrink-0 overflow-y-auto">
              {/* Category Selection Box (Highlighted in Step 3) */}
              <div
                data-tour="company-category-selection"
                className={`p-5 border-b border-slate-200 transition-all ${
                  isCategoryStep
                    ? "bg-blue-50/70 ring-4 ring-blue-400/80 rounded-xl m-2"
                    : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TbChecklist className="text-blue-600" size={17} />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Category Selection
                    </span>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    4 Sections
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Switch between exam categories anytime during your company assessment:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Quantitative Aptitude", active: true, count: "10 Qs" },
                    { name: "Logical Reasoning", active: false, count: "10 Qs" },
                    { name: "Verbal Ability", active: false, count: "5 Qs" },
                    { name: "Technical / Coding", active: false, count: "5 Qs" },
                  ].map((sec) => (
                    <button
                      key={sec.name}
                      type="button"
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                        sec.active
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm font-bold"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium"
                      }`}
                    >
                      <span className="line-clamp-1 leading-tight font-bold">{sec.name}</span>
                      <span
                        className={`text-[10px] mt-1 ${
                          sec.active ? "text-blue-200" : "text-slate-400"
                        }`}
                      >
                        {sec.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Navigator */}
              <div className="p-5 flex flex-col gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Question Palette
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors ${
                        i === 0
                          ? "bg-blue-600 text-white border-blue-600"
                          : i === 1
                          ? "bg-purple-100 text-purple-700 border-purple-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[10.5px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Answered
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Unvisited
                  </span>
                </div>
              </div>
            </div>

            {/* Step 5: Test Submission Confirmation Overlay */}
            {isSubmitStep && (
              <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <motion.div
                  data-tour="company-submit-confirm-popup"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center border border-slate-100"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                    <TbAlertCircle size={36} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    Submit Assessment?
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 mb-6 leading-relaxed px-2">
                    Are you sure you want to submit your assessment? You have reviewed all sections. Answers cannot be changed once submitted.
                  </p>

                  <div className="flex w-full gap-3">
                    <button
                      data-tour="company-continue-test-btn"
                      type="button"
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer border-none"
                    >
                      Continue Test
                    </button>
                    <button
                      data-tour="company-yes-submit-btn"
                      type="button"
                      className="flex-1 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl text-xs shadow-md transition-shadow cursor-pointer border-none"
                    >
                      Yes, Submit
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        ) : (
          /* STEP 6: Results View & Dashboard Navigation */
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-[#EFF5FB] flex flex-col">
            <div className="max-w-4xl mx-auto w-full space-y-5">
              {/* Submission Success Banner */}
              <div className="p-4 bg-emerald-500 text-white rounded-2xl flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                    <TbCircleCheck size={24} />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm block">
                      Test Submitted Successfully!
                    </span>
                    <span className="text-xs text-emerald-100">
                      Your test responses have been graded against TCS recruitment criteria.
                    </span>
                  </div>
                </div>

                <button
                  data-tour="company-results-dashboard"
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-black shadow-sm hover:bg-emerald-50 transition-all border border-emerald-200 active:scale-95 shrink-0"
                >
                  <TbLayoutDashboard size={15} />
                  <span>Return to Dashboard</span>
                </button>
              </div>

              {/* Scorecard Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Candidate Scorecard
                  </span>
                  <h2 className="text-xl font-black text-slate-900 m-0">
                    TCS National Qualifier Mock Test
                  </h2>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Marks Scored
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      26 <span className="text-xs text-slate-400 font-semibold">/ 30</span>
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-sm flex items-center gap-1.5">
                    <TbAward size={18} />
                    <span>86.6% Score</span>
                  </div>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">Total Questions</span>
                  <span className="text-lg font-black text-slate-800">30</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-center bg-emerald-50/30">
                  <span className="text-emerald-600 font-bold block text-[11px] mb-0.5">Correct Answers</span>
                  <span className="text-lg font-black text-emerald-700">26</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-rose-200 text-center bg-rose-50/30">
                  <span className="text-rose-500 font-bold block text-[11px] mb-0.5">Wrong Answers</span>
                  <span className="text-lg font-black text-rose-600">3</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">Unanswered</span>
                  <span className="text-lg font-black text-slate-600">1</span>
                </div>
              </div>

              {/* Question Review Sample Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-700">Question 1 Review</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <TbCheck size={14} /> Correct (+1.0 Mark)
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium">
                  A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Selected Option</span>
                    <span className="font-bold text-emerald-600">B. 150 metres</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correct Key</span>
                    <span className="font-bold text-slate-800">B. 150 metres</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs text-amber-900">
                  <span className="font-bold block mb-1">Explanation:</span>
                  <span>Speed = 60 &times; (5/18) = 50/3 m/sec. Length of train = Speed &times; Time = (50/3) &times; 9 = 150 metres.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
