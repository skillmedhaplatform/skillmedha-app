"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  CloudUploadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { TbSparkles, TbBrain } from "react-icons/tb";

export default function ResumeUploadDemoModal({
  isOpen,
  stepIndex = 1,
}) {
  if (!isOpen) return null;

  // stepIndex 1 = File Dropzone (Step 2 in tour)
  // stepIndex 2 = AI Extraction & Parsing (Step 3 in tour)
  // stepIndex 3 = Review Extracted Data & Pre-populated Template (Step 4 in tour)
  const isDropzoneStep = stepIndex === 1;
  const isParsingStep = stepIndex === 2;
  const isPopulatedStep = stepIndex === 3;

  return (
    <div
      className="fixed inset-0 z-[9988] flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 backdrop-blur-sm pointer-events-auto"
      aria-label="Upload Resume Demo Preview"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/90 relative"
      >
        {/* Top Header */}
        <div className="w-full bg-[#071631] text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <CloudUploadOutlined className="text-lg" />
            </div>
            <div>
              <span className="text-[14px] font-bold text-white flex items-center gap-2">
                Smart Resume Parser
              </span>
              <span className="text-[10px] text-slate-300 block">
                Upload your existing resume to auto-populate any template
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-400/30">
            <TbBrain className="text-sm" />
            <span>AI-Powered Extraction</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-[#F8FAFC]">
          {!isPopulatedStep ? (
            <div className="space-y-6">
              {/* Step 2: Upload Dropzone Area */}
              <div
                data-tour="resume-demo-upload-dropzone"
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                  isDropzoneStep
                    ? "border-purple-500 bg-purple-50/50 shadow-md ring-2 ring-purple-300"
                    : "border-slate-300 bg-white"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 shadow-xs">
                  <CloudUploadOutlined className="text-3xl" />
                </div>
                <h3 className="text-base font-extrabold text-slate-800 mb-1">
                  Drag and drop your resume file here
                </h3>
                <p className="text-xs text-slate-500 mb-4 max-w-sm">
                  We support PDF and DOCX formats up to 5MB. Our parser will extract contact info, experience, and education automatically.
                </p>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                    <FilePdfOutlined className="text-red-500" /> PDF Document
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                    <FileWordOutlined className="text-blue-600" /> Word DOCX
                  </span>
                </div>
              </div>

              {/* Step 3: Simulated AI Parsing Progress */}
              <div
                data-tour="resume-demo-upload-parsing"
                className={`bg-white rounded-2xl p-5 border transition-all ${
                  isParsingStep
                    ? "border-purple-400 ring-2 ring-purple-300 shadow-md bg-purple-50/20"
                    : "border-slate-200/80"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TbSparkles className="text-purple-600 text-base" />
                    <span className="text-xs font-extrabold text-slate-800">
                      AI Parsing Engine in Progress
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    Parsing: resume_senior_dev.pdf
                  </span>
                </div>

                {/* Parsing Status Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircleFilled className="text-emerald-600" />
                    <span>Contact Info: John Doe (john@example.com)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircleFilled className="text-emerald-600" />
                    <span>Experience: 2 roles parsed (Google, Meta)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircleFilled className="text-emerald-600" />
                    <span>Education: B.Tech Computer Science</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircleFilled className="text-emerald-600" />
                    <span>Skills: React, Next.js, TypeScript, Node.js</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Step 4: Pre-Populated Design Preview */
            <div
              data-tour="resume-demo-upload-populated"
              className="bg-white rounded-2xl border-2 border-purple-400 p-6 shadow-lg space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircleOutlined />
                  </span>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-none">
                      Resume Extracted & Ready in Modern Template!
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      All sections have been structured. You can tweak any text or change templates with one click.
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-white bg-purple-600 px-3 py-1.5 rounded-xl shadow-xs">
                  Open in Editor →
                </span>
              </div>

              {/* Sample Populated Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Candidate Profile
                  </span>
                  <div className="font-extrabold text-slate-800 text-sm">John Doe</div>
                  <div className="text-purple-700 font-semibold">Full-Stack Engineer</div>
                  <div className="text-slate-500 text-[11px]">San Francisco, CA</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Extracted Work History
                  </span>
                  <div className="font-bold text-slate-800">Software Engineer • Google</div>
                  <div className="text-slate-500 text-[11px]">2022 - Present • Frontend Infrastructure</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Key Skills Recognized
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {["React", "TypeScript", "Next.js", "Python", "GraphQL"].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-[10px] text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
