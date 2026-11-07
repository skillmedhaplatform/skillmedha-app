"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  BarChartOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  FileSearchOutlined,
} from "@ant-design/icons";
import { TbTarget, TbHistory } from "react-icons/tb";

export default function ResumeAtsDemoModal({
  isOpen,
  stepIndex = 1,
}) {
  if (!isOpen) return null;

  // stepIndex 1 = Dual Inputs: Resume & Job Description (Step 2 in tour)
  // stepIndex 2 = Overall ATS Score Dial (Step 3 in tour)
  // stepIndex 3 = Detailed Keyword Breakdown & Insights (Step 4 in tour)
  // stepIndex 4 = Scan History Panel (Step 5 in tour)
  const isInputStep = stepIndex === 1;
  const isScoreStep = stepIndex === 2;
  const isBreakdownStep = stepIndex === 3;
  const isHistoryStep = stepIndex === 4;

  return (
    <div
      className="fixed inset-0 z-[9988] flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 backdrop-blur-sm pointer-events-auto"
      aria-label="ATS Resume Checker Preview"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="w-full max-w-5xl max-h-[92vh] bg-[#F8FAFC] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/90 relative"
      >
        {/* Top Header */}
        <div className="w-full bg-[#071631] text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <BarChartOutlined className="text-lg" />
            </div>
            <div>
              <span className="text-[14px] font-bold text-white flex items-center gap-2">
                ATS Compatibility Checker
              </span>
              <span className="text-[10px] text-slate-300 block">
                Evaluate resume against automated applicant tracking systems
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
            <TbTarget className="text-sm" />
            <span>Target Role: Senior Frontend Engineer</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Step 2: Dual Input Area (Upload Resume + Job Description) */}
          <div
            data-tour="ats-demo-inputs"
            className={`bg-white rounded-2xl p-5 border transition-all ${
              isInputStep
                ? "border-emerald-500 ring-2 ring-emerald-300 shadow-md"
                : "border-slate-200/80 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileSearchOutlined className="text-emerald-600" />
                Input Data for ATS Analysis
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Ready to Scan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  1. Candidate Resume File
                </span>
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>alex_frontend_engineer.pdf (1.4 MB)</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  3 sections • 420 words • Clean machine-readable layout
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  2. Target Job Description (JD)
                </span>
                <div className="font-bold text-slate-800 line-clamp-1">
                  Google: Senior Frontend Engineer (React, TypeScript, Web Vitals)
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Target criteria: 15 core keywords • 3+ years required
                </span>
              </div>
            </div>
          </div>

          {/* Results Grid: Score Dial (Step 3) & Detailed Breakdown (Step 4) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 3: ATS Score Dial Card */}
            <div
              data-tour="ats-demo-score-dial"
              className={`bg-white rounded-2xl p-6 border flex flex-col items-center text-center justify-between transition-all ${
                isScoreStep
                  ? "border-emerald-500 ring-2 ring-emerald-300 shadow-md"
                  : "border-slate-200/80 shadow-xs"
              }`}
            >
              <div className="w-full text-left mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Overall ATS Score
                </span>
                <span className="text-sm font-extrabold text-slate-800">
                  Interview Ready
                </span>
              </div>

              {/* Dial Circle */}
              <div className="relative w-36 h-36 rounded-full border-8 border-emerald-500/20 flex items-center justify-center my-3 bg-emerald-50/30">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-emerald-600 leading-none">
                    88
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 mt-1">
                    Out of 100
                  </span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-center text-xs pt-3 border-t border-slate-100">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-bold">Match Rate</div>
                  <div className="font-black text-slate-800 text-sm">92%</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-bold">Readability</div>
                  <div className="font-black text-slate-800 text-sm">95%</div>
                </div>
              </div>
            </div>

            {/* Step 4: Keywords & Suggestions Breakdown */}
            <div
              data-tour="ats-demo-breakdown"
              className={`md:col-span-2 bg-white rounded-2xl p-6 border flex flex-col justify-between space-y-4 transition-all ${
                isBreakdownStep
                  ? "border-emerald-500 ring-2 ring-emerald-300 shadow-md"
                  : "border-slate-200/80 shadow-xs"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Semantic Keyword Matching
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 mb-3">
                  12/15 Target Skills Verified in Candidate Resume
                </h4>

                <div className="space-y-3">
                  {/* Matched Keywords */}
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mb-1.5">
                      <CheckCircleFilled className="text-emerald-500" />
                      Matched Skills (High Recruiter Impact)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["React 18", "TypeScript", "Next.js", "Redux Toolkit", "Web Vitals", "Jest"].map((k) => (
                        <span key={k} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          ✓ {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div>
                    <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1 mb-1.5">
                      <CloseCircleFilled className="text-amber-500" />
                      Suggested Keywords to Add
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["GraphQL APIs", "CI/CD GitHub Actions", "Docker Containers"].map((k) => (
                        <span key={k} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                          + {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                <span>Actionable Tip: Incorporate 2 of the missing keywords to cross the 95+ score threshold.</span>
                <span className="font-bold text-blue-700 underline cursor-pointer">Optimize →</span>
              </div>
            </div>
          </div>

          {/* Step 5: Historical Comparison Panel */}
          <div
            data-tour="ats-demo-history"
            className={`bg-white rounded-2xl p-5 border transition-all ${
              isHistoryStep
                ? "border-emerald-500 ring-2 ring-emerald-300 shadow-md"
                : "border-slate-200/80 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <TbHistory className="text-base text-slate-600" />
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Scan History & Score Improvement
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Tracking revisions across applications
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Draft v1.0</div>
                  <div className="text-[10px] text-slate-400">2 weeks ago</div>
                </div>
                <span className="text-base font-black text-amber-600">72%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Draft v1.2</div>
                  <div className="text-[10px] text-slate-400">3 days ago</div>
                </div>
                <span className="text-base font-black text-blue-600">81%</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900">Current Revision</div>
                  <div className="text-[10px] text-emerald-600">Just now</div>
                </div>
                <span className="text-base font-black text-emerald-600">88%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
