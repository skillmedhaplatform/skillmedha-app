"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import {
  FileAddOutlined,
  CloudUploadOutlined,
  BarChartOutlined,
  ArrowRightOutlined,
  CompassOutlined,
} from "@ant-design/icons";

export default function ResumeGuideSelectorModal({
  isOpen,
  onClose,
  onSelectGuide,
}) {
  const workflows = [
    {
      id: "resume-scratch",
      title: "Create Resume from Scratch",
      badge: "Full Builder Tour",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      icon: <FileAddOutlined className="text-2xl" />,
      iconBg: "from-[#1E69DA] to-blue-500",
      description:
        "Learn how to choose modern templates, complete section accordions step-by-step, customize live previews, and download your ATS-ready PDF.",
      steps: "5 Steps",
      duration: "~2 mins",
      buttonColor: "bg-[#1E69DA] hover:bg-[#1855b3]",
    },
    {
      id: "resume-upload",
      title: "Upload & Enhance Existing Resume",
      badge: "Smart AI Parser",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      icon: <CloudUploadOutlined className="text-2xl" />,
      iconBg: "from-purple-600 to-fuchsia-500",
      description:
        "Learn how to upload your PDF/DOCX resume, let intelligent AI extract your experience, and populate it directly into modern templates.",
      steps: "4 Steps",
      duration: "~1.5 mins",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
    {
      id: "resume-ats",
      title: "ATS Score Check & Optimization",
      badge: "Recruiter Scanner",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: <BarChartOutlined className="text-2xl" />,
      iconBg: "from-emerald-600 to-teal-500",
      description:
        "Learn how to test your resume against job descriptions, review matching keywords, action verb impact, and track score improvements.",
      steps: "5 Steps",
      duration: "~2 mins",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="relative w-full max-w-[920px] bg-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col z-10 border border-slate-100 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            aria-label="Close"
          >
            <IoClose size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E69DA]">
              <CompassOutlined className="text-xl" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1E69DA]">
                Interactive Onboarding
              </span>
              <h2 className="text-[22px] sm:text-[24px] font-extrabold text-slate-900 tracking-tight leading-snug">
                Resume Builder Guides
              </h2>
            </div>
          </div>

          <p className="text-[14px] text-slate-500 leading-relaxed mb-0">
            Select the specific workflow you would like to explore. Each guide provides an interactive walkthrough with visual examples.
          </p>

          {/* 3 Workflow Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 sm:mt-10 mb-2">
            {workflows.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectGuide(item.id)}
                className="group relative bg-slate-50/70 hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.iconBg} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                    >
                      {item.icon}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-[16px] font-bold text-slate-800 tracking-tight mb-2 group-hover:text-[#1E69DA] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-[12.5px] text-slate-600 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 shrink-0 whitespace-nowrap">
                    <span>{item.steps}</span>
                    <span className="text-slate-300">•</span>
                    <span>{item.duration}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11.5px] font-bold text-white px-2.5 py-1.5 rounded-lg shadow-sm ${item.buttonColor} transition-transform group-hover:translate-x-0.5 shrink-0 whitespace-nowrap`}
                  >
                    <span>Start Tour</span>
                    <ArrowRightOutlined className="text-[10px]" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}

