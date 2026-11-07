"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  FileTextOutlined,
  DownloadOutlined,
  UserOutlined,
  BookOutlined,
  SolutionOutlined,
  CodeOutlined,
  CheckSquareOutlined,
  EyeOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { TbSparkles, TbZoomIn, TbZoomOut, TbPalette } from "react-icons/tb";

export default function ResumeScratchDemoModal({
  isOpen,
  stepIndex = 1,
}) {
  if (!isOpen) return null;

  // stepIndex 1 = Template Selection (Step 2 in tour)
  // stepIndex 2 = Section Details Accordions (Step 3 in tour)
  // stepIndex 3 = Live Preview & Customization (Step 4 in tour)
  // stepIndex 4 = Export / Download PDF (Step 5 in tour)
  const isTemplateStep = stepIndex === 1;
  const isAccordionStep = stepIndex === 2;
  const isPreviewStep = stepIndex === 3;
  const isDownloadStep = stepIndex === 4;

  const mockTemplates = [
    { id: 1, name: "Modern Professional", category: "Modern", color: "#1E69DA", popular: true },
    { id: 2, name: "Minimalist Clean", category: "Simple", color: "#0f766e", popular: false },
    { id: 3, name: "Executive Suite", category: "Executive", color: "#4f46e5", popular: true },
    { id: 4, name: "Creative Edge", category: "Creative", color: "#e11d48", popular: false },
  ];

  return (
    <div
      className="fixed inset-0 z-[9988] flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 backdrop-blur-sm pointer-events-auto"
      aria-label="Resume Builder Workspace Preview"
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
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <FileTextOutlined className="text-base" />
            </div>
            <div>
              <span className="text-[13.5px] font-bold text-white flex items-center gap-2">
                Resume Builder • John Doe
              </span>
              <span className="text-[10px] text-slate-300 block">
                Target Role: Full-Stack Developer
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-white/90 border border-white/15">
              <TbSparkles className="text-yellow-300" />
              <span>Auto-Saving Enabled</span>
            </div>

            {/* Download PDF Button (Highlighted in Step 5) */}
            <button
              data-tour="resume-demo-download-btn"
              type="button"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isDownloadStep
                  ? "!bg-emerald-600 !text-white shadow-lg ring-4 ring-emerald-300 animate-pulse scale-[1.02]"
                  : "bg-[#1E69DA] hover:bg-[#1855b3] text-white"
              }`}
            >
              <DownloadOutlined />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* View Mode: Either Template Selection (Step 2) OR Split-Pane Editor (Steps 3-5) */}
        {isTemplateStep ? (
          /* ─── TEMPLATE GALLERY VIEW (Step 2) ─── */
          <div className="flex-1 overflow-y-auto p-6 bg-[#EFF5FB] flex flex-col items-center">
            <div className="w-full max-w-4xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Choose Your Design
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select from 40+ ATS-friendly templates. You can switch templates anytime without losing data.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {["All", "Modern", "Simple", "Executive"].map((tab, idx) => (
                    <span
                      key={tab}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        idx === 0
                          ? "bg-[#1E69DA] text-white"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>

              {/* Template Cards Grid (Highlighted) */}
              <div
                data-tour="resume-demo-templates"
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-white/80 rounded-2xl border border-slate-200/80 shadow-xs"
              >
                {mockTemplates.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border transition-all overflow-hidden bg-white shadow-xs group ${
                      idx === 0
                        ? "border-[#1E69DA] ring-2 ring-blue-300 shadow-md"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="h-44 bg-slate-100 p-2 relative flex flex-col justify-between overflow-hidden">
                      <div className="w-full h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                      <div className="space-y-1.5 opacity-60">
                        <div className="w-3/4 h-2 bg-slate-400 rounded-xs" />
                        <div className="w-full h-1 bg-slate-300 rounded-xs" />
                        <div className="w-5/6 h-1 bg-slate-300 rounded-xs" />
                      </div>
                      <div className="space-y-1 opacity-50">
                        <div className="w-1/2 h-1.5 bg-slate-400 rounded-xs" />
                        <div className="w-full h-1 bg-slate-300 rounded-xs" />
                        <div className="w-2/3 h-1 bg-slate-300 rounded-xs" />
                      </div>

                      {item.popular && (
                        <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                        {item.name}
                      </span>
                      {idx === 0 && (
                        <CheckCircleFilled className="text-[#1E69DA] text-xs" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ─── SPLIT-PANE EDITOR VIEW (Steps 3 - 5) ─── */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-[#EFF5FB]">
            {/* LEFT PANE: Form Accordions */}
            <div
              data-tour="resume-demo-accordions"
              className={`w-full md:w-[48%] h-full flex flex-col border-r border-slate-200 bg-white overflow-y-auto p-4 space-y-3 shrink-0 transition-all ${
                isAccordionStep ? "ring-2 ring-blue-400 shadow-sm" : ""
              }`}
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Resume Sections
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  85% Complete
                </span>
              </div>

              {/* Accordion Item: Basic Details */}
              <div className="border border-blue-200 rounded-xl bg-blue-50/30 p-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserOutlined className="text-blue-600 text-sm" />
                    <span className="text-xs font-bold text-slate-900">
                      Personal Information
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    Required
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2.5 text-[11px]">
                  <div className="p-1.5 bg-white rounded-md border border-slate-200 font-medium text-slate-700">
                    John Doe
                  </div>
                  <div className="p-1.5 bg-white rounded-md border border-slate-200 font-medium text-slate-700">
                    john@example.com
                  </div>
                </div>
              </div>

              {/* Accordion Item: Experience */}
              <div className="border border-slate-200 rounded-xl bg-white p-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SolutionOutlined className="text-indigo-600 text-sm" />
                    <span className="text-xs font-bold text-slate-900">
                      Work Experience (2)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Added</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="font-bold text-slate-800">Software Engineer • Google</div>
                  <div className="text-[10px] text-slate-400">2022 - Present • San Francisco, CA</div>
                </div>
              </div>

              {/* Accordion Item: Education */}
              <div className="border border-slate-200 rounded-xl bg-white p-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOutlined className="text-emerald-600 text-sm" />
                    <span className="text-xs font-bold text-slate-900">
                      Education & Degrees
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Added</span>
                </div>
              </div>

              {/* Accordion Item: Skills */}
              <div className="border border-slate-200 rounded-xl bg-white p-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CodeOutlined className="text-amber-600 text-sm" />
                    <span className="text-xs font-bold text-slate-900">
                      Key Technical Skills (8)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Added</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {["React", "TypeScript", "Node.js", "Python", "SQL"].map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Accordion Item: Projects */}
              <div className="border border-slate-200 rounded-xl bg-white p-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquareOutlined className="text-purple-600 text-sm" />
                    <span className="text-xs font-bold text-slate-900">
                      Projects & Portfolio
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Added</span>
                </div>
              </div>
            </div>

            {/* RIGHT PANE: Live Canvas Preview & Toolbar */}
            <div
              data-tour="resume-demo-preview"
              className={`flex-1 h-full flex flex-col bg-[#525659]/10 overflow-hidden relative transition-all ${
                isPreviewStep ? "ring-2 ring-blue-500 shadow-lg" : ""
              }`}
            >
              {/* Floating Customization Toolbar */}
              <div className="h-10 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-xs z-10">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <TbPalette className="text-base text-blue-600" />
                    <span>Theme:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {["#1E69DA", "#4f46e5", "#0f766e", "#e11d48"].map((c, i) => (
                      <span
                        key={c}
                        className={`w-4 h-4 rounded-full cursor-pointer transition-transform ${
                          i === 0 ? "ring-2 ring-blue-500 scale-110" : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md font-mono">
                    <EyeOutlined /> 100%
                  </span>
                  <button type="button" className="p-1 hover:text-slate-800">
                    <TbZoomIn size={15} />
                  </button>
                  <button type="button" className="p-1 hover:text-slate-800">
                    <TbZoomOut size={15} />
                  </button>
                </div>
              </div>

              {/* A4 Document Preview Canvas */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
                <div className="w-[380px] bg-white rounded-lg shadow-xl p-5 border border-slate-200 text-slate-800 text-[11px] leading-relaxed scale-95 origin-top">
                  {/* Resume Header */}
                  <div className="border-b-2 border-[#1E69DA] pb-3 mb-3">
                    <h1 className="text-base font-extrabold text-slate-900 m-0">John Doe</h1>
                    <div className="text-[10px] text-[#1E69DA] font-bold">
                      Full-Stack Software Engineer
                    </div>
                    <div className="text-[9.5px] text-slate-500 mt-1 flex gap-2">
                      <span>john@example.com</span>
                      <span>•</span>
                      <span>+1 555-0199</span>
                      <span>•</span>
                      <span>San Francisco, CA</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mb-3">
                    <div className="text-[10px] font-black uppercase text-slate-800 tracking-wider mb-1">
                      Professional Summary
                    </div>
                    <p className="text-[9.5px] text-slate-600 m-0">
                      Results-oriented Full-Stack Developer with 4+ years of experience designing scalable web architectures using React, Next.js, and Node.js.
                    </p>
                  </div>

                  {/* Experience */}
                  <div className="mb-3">
                    <div className="text-[10px] font-black uppercase text-slate-800 tracking-wider mb-1">
                      Experience
                    </div>
                    <div className="space-y-1.5">
                      <div>
                        <div className="font-bold text-slate-800 flex justify-between text-[10px]">
                          <span>Software Engineer • Google</span>
                          <span className="text-slate-400 font-normal">2022 - Present</span>
                        </div>
                        <p className="text-[9px] text-slate-600 m-0">
                          Architected customer dashboard microservices, reducing initial render latency by 34%.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-800 tracking-wider mb-1">
                      Skills
                    </div>
                    <div className="text-[9px] text-slate-600">
                      JavaScript, TypeScript, React, Next.js, Node.js, Python, PostgreSQL, AWS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
