"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbChevronLeft,
  TbChevronDown,
  TbPlayerPlay,
  TbCode,
  TbCheck,
  TbTerminal2,
  TbFileDescription,
  TbHistory,
  TbClock,
  TbCpu,
  TbSparkles,
} from "react-icons/tb";

export default function CodingWorkspaceDemoModal({
  isOpen,
  stepIndex = 2,
}) {
  if (!isOpen) return null;

  // stepIndex 2 = Coding Environment & Description (Step 3 in tour)
  // stepIndex 3 = Programming Language Selection (Step 4 in tour)
  // stepIndex 4 = Run Code (Step 5 in tour: test cases all green passed)
  // stepIndex 5 = Submit Code (Step 6 in tour: Submit button & Submissions tab)
  const isLanguageStep = stepIndex === 3;
  const isRunStep = stepIndex === 4;
  const isSubmitStep = stepIndex === 5;
  const showSubmissionsTab = stepIndex === 5;

  return (
    <div
      className="fixed inset-0 z-[9988] flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 backdrop-blur-sm pointer-events-auto"
      aria-label="Coding Environment Preview"
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
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/90 border border-white/15 transition-colors"
            >
              <TbChevronLeft size={16} />
              <span>Problem List</span>
            </button>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-[14px] font-bold tracking-tight text-white flex items-center gap-2">
              Problem 1 of 24 • Two Sum
            </span>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
              Easy
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-white/95 border border-white/15">
              <TbSparkles className="text-sm text-yellow-300" />
              <span>Practice Workspace</span>
            </div>
          </div>
        </div>

        {/* Main Split-Pane Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-[#EFF5FB]">
          {/* LEFT PANE: Description & Submissions */}
          <div className="w-full md:w-[45%] h-full flex flex-col border-r border-slate-200 bg-white overflow-hidden shrink-0">
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 px-3 bg-slate-50 shrink-0">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold border-b-2 transition-all ${
                    !showSubmissionsTab
                      ? "border-blue-600 text-blue-600 bg-white"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <TbFileDescription size={15} />
                  <span>Description</span>
                </button>

                <button
                  data-tour="coding-submissions-tab"
                  type="button"
                  className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold border-b-2 transition-all ${
                    showSubmissionsTab
                      ? "!border-blue-600 !text-blue-600 bg-white shadow-xs ring-2 ring-blue-300 rounded-t-lg"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <TbHistory size={15} />
                  <span>Submissions</span>
                  {showSubmissionsTab && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-0.5" />
                  )}
                </button>
              </div>

              <span className="text-[11px] font-semibold text-slate-400">
                Points: 100
              </span>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <AnimatePresence mode="wait">
                {!showSubmissionsTab ? (
                  /* Description Tab View */
                  <motion.div
                    key="desc"
                    data-tour="coding-environment-desc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight m-0">
                          1. Two Sum
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                          Easy
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>Topics:</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          Array
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          Hash Table
                        </span>
                      </div>
                    </div>

                    <div className="text-xs sm:text-[13px] text-slate-700 leading-relaxed space-y-2.5">
                      <p>
                        Given an array of integers <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded">nums</code> and an integer <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded">target</code>, return indices of the two numbers such that they add up to <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded">target</code>.
                      </p>
                      <p>
                        You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice. You can return the answer in any order.
                      </p>
                    </div>

                    {/* Example 1 */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1 text-xs">
                      <span className="font-bold text-slate-800 block">Example 1:</span>
                      <div className="font-mono text-slate-700 space-y-0.5">
                        <div><strong>Input:</strong> nums = [2,7,11,15], target = 9</div>
                        <div><strong>Output:</strong> [0,1]</div>
                        <div><strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</div>
                      </div>
                    </div>

                    {/* Example 2 */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1 text-xs">
                      <span className="font-bold text-slate-800 block">Example 2:</span>
                      <div className="font-mono text-slate-700 space-y-0.5">
                        <div><strong>Input:</strong> nums = [3,2,4], target = 6</div>
                        <div><strong>Output:</strong> [1,2]</div>
                      </div>
                    </div>

                    {/* Constraints */}
                    <div className="space-y-1 text-xs text-slate-600 pt-1">
                      <span className="font-bold text-slate-800 block">Constraints:</span>
                      <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11.5px]">
                        <li>2 &lt;= nums.length &lt;= 10⁴</li>
                        <li>-10⁹ &lt;= nums[i] &lt;= 10⁹</li>
                        <li>-10⁹ &lt;= target &lt;= 10⁹</li>
                        <li>Only one valid answer exists.</li>
                      </ul>
                    </div>
                  </motion.div>
                ) : (
                  /* Submissions Tab View (Active in Step 6) */
                  <motion.div
                    key="submissions"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-600 text-white flex items-center gap-1">
                            <TbCheck size={14} /> Accepted
                          </span>
                          <span className="text-xs font-bold text-emerald-800">
                            All 3/3 Test Cases Passed
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-700 mt-1 block">
                          Submitted just now • Python 3
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-emerald-700 bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-xs">
                        +100 Coins
                      </span>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                          <TbClock size={15} />
                          <span>Runtime</span>
                        </div>
                        <div className="text-base font-extrabold text-slate-900">
                          42 ms
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600">
                          Beats 88.40% of users
                        </span>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                          <TbCpu size={15} />
                          <span>Memory</span>
                        </div>
                        <div className="text-base font-extrabold text-slate-900">
                          16.2 MB
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600">
                          Beats 74.15% of users
                        </span>
                      </div>
                    </div>

                    {/* Historical Attempt List */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                        Submission History
                      </span>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                        <div className="flex items-center justify-between p-2.5 bg-white">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold">Accepted</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 font-mono">42 ms</span>
                          </div>
                          <span className="text-slate-400 text-[11px]">Just now</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-slate-50/70">
                          <div className="flex items-center gap-2">
                            <span className="text-red-500 font-bold">Wrong Answer</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 font-mono">38 ms</span>
                          </div>
                          <span className="text-slate-400 text-[11px]">5 mins ago</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT PANE: Code Editor & Console */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#1E1E1E]">
            {/* Editor Header */}
            <div className="h-10 bg-[#252526] text-white px-4 flex items-center justify-between border-b border-[#333333] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <TbCode color="#4ADE80" size={16} />
                  <span>Code</span>
                </div>

                {/* Language Selector */}
                <div
                  data-tour="coding-language-selector"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    isLanguageStep
                      ? "bg-blue-600 text-white shadow-lg ring-4 ring-blue-400 animate-pulse"
                      : "bg-[#333333] text-slate-200 hover:bg-[#3D3D3D] border border-white/10"
                  }`}
                >
                  <span>Python 3</span>
                  <TbChevronDown size={13} />
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                UTF-8 • Spaces: 4
              </span>
            </div>

            {/* Code Area (Simulated Monaco Editor) */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[12.5px] leading-relaxed text-[#D4D4D4] bg-[#1E1E1E]">
              <div className="space-y-1">
                <div>
                  <span className="text-[#569CD6]">class</span>{" "}
                  <span className="text-[#4EC9B0]">Solution</span>:
                </div>
                <div className="pl-6">
                  <span className="text-[#569CD6]">def</span>{" "}
                  <span className="text-[#DCDCAA]">twoSum</span>(
                  <span className="text-[#9CDCFE]">self</span>,{" "}
                  <span className="text-[#9CDCFE]">nums</span>:{" "}
                  <span className="text-[#4EC9B0]">List</span>[
                  <span className="text-[#4EC9B0]">int</span>],{" "}
                  <span className="text-[#9CDCFE]">target</span>:{" "}
                  <span className="text-[#4EC9B0]">int</span>) -&gt;{" "}
                  <span className="text-[#4EC9B0]">List</span>[
                  <span className="text-[#4EC9B0]">int</span>]:
                </div>
                <div className="pl-12 text-[#6A9955]">
                  # One-pass Hash Map approach: O(n) time, O(n) space
                </div>
                <div className="pl-12">
                  <span className="text-[#9CDCFE]">prevMap</span> = {}
                </div>
                <div className="pl-12">
                  <span className="text-[#C586C0]">for</span>{" "}
                  <span className="text-[#9CDCFE]">i</span>,{" "}
                  <span className="text-[#9CDCFE]">n</span>{" "}
                  <span className="text-[#C586C0]">in</span>{" "}
                  <span className="text-[#DCDCAA]">enumerate</span>(
                  <span className="text-[#9CDCFE]">nums</span>):
                </div>
                <div className="pl-16">
                  <span className="text-[#9CDCFE]">diff</span> ={" "}
                  <span className="text-[#9CDCFE]">target</span> -{" "}
                  <span className="text-[#9CDCFE]">n</span>
                </div>
                <div className="pl-16">
                  <span className="text-[#C586C0]">if</span>{" "}
                  <span className="text-[#9CDCFE]">diff</span>{" "}
                  <span className="text-[#C586C0]">in</span>{" "}
                  <span className="text-[#9CDCFE]">prevMap</span>:
                </div>
                <div className="pl-20">
                  <span className="text-[#C586C0]">return</span> [
                  <span className="text-[#9CDCFE]">prevMap</span>[
                  <span className="text-[#9CDCFE]">diff</span>],{" "}
                  <span className="text-[#9CDCFE]">i</span>]
                </div>
                <div className="pl-16">
                  <span className="text-[#9CDCFE]">prevMap</span>[
                  <span className="text-[#9CDCFE]">n</span>] ={" "}
                  <span className="text-[#9CDCFE]">i</span>
                </div>
                <div className="pl-12">
                  <span className="text-[#C586C0]">return</span> []
                </div>
              </div>
            </div>

            {/* Bottom Console / Testcase Panel */}
            <div className="bg-[#252526] border-t border-[#333333] flex flex-col shrink-0">
              {/* Console Header */}
              <div className="h-9 px-4 flex items-center justify-between border-b border-[#333333] text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 font-bold text-slate-300">
                    <TbTerminal2 size={15} /> Console
                  </span>
                  <div className="h-3.5 w-px bg-white/10" />
                  <span
                    className={`font-semibold ${
                      isRunStep ? "text-emerald-400 font-bold" : "text-slate-400"
                    }`}
                  >
                    {isRunStep ? "Test Results: 3/3 Passed" : "Test Cases (3)"}
                  </span>
                </div>
              </div>

              {/* Testcase Blocks (Turn GREEN during Step 5) */}
              <div className="p-3 bg-[#1E1E1E] flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((caseNum) => (
                    <div
                      key={caseNum}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isRunStep
                          ? "bg-emerald-950/70 border border-emerald-500/80 text-emerald-300 shadow-sm"
                          : caseNum === 1
                          ? "bg-[#333333] text-white border border-white/20"
                          : "bg-[#2A2A2A] text-slate-400 border border-white/5"
                      }`}
                    >
                      {isRunStep ? (
                        <TbCheck color="#22C55E" size={14} />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      )}
                      <span>Case {caseNum}</span>
                      {isRunStep && (
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          Passed
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Test case detail */}
                <div className="bg-[#181818] p-2.5 rounded-lg border border-white/5 text-xs font-mono text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-500">nums =</span> [2, 7, 11, 15]
                  </div>
                  <div>
                    <span className="text-slate-500">target =</span> 9
                  </div>
                  {isRunStep && (
                    <div className="text-emerald-400 pt-0.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span>Output: [0, 1] (Matches Expected)</span>
                      <span>Runtime: 0.012 s</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Action Buttons */}
              <div className="px-4 py-2.5 bg-[#252526] border-t border-[#333333] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Auto-formatted with Black
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    data-tour="coding-run-button"
                    type="button"
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isRunStep
                        ? "!bg-[#1E69DA] !text-white shadow-lg ring-4 ring-blue-400 animate-pulse"
                        : "bg-[#3A3D41] hover:bg-[#4E5157] text-white"
                    }`}
                  >
                    <TbPlayerPlay size={14} />
                    <span>Run Code</span>
                  </button>

                  <button
                    data-tour="coding-submit-button"
                    type="button"
                    className={`flex items-center gap-1.5 px-5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isSubmitStep
                        ? "!bg-emerald-600 !text-white shadow-lg ring-4 ring-emerald-300 animate-pulse scale-[1.02]"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    <TbCode size={15} />
                    <span>Submit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
