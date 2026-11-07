"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TourWelcomeIcon } from "./TourIcons";
import { FaArrowRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

export default function TourWelcomeModal({
  isOpen,
  badge = "Welcome to SkillMedha",
  title = "Welcome to SkillMedha!",
  description = "Your learning journey starts here. Let's take a quick tour to help you explore the platform.",
  ctaText = "Start Tour",
  onStartTour,
  onSkip,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onSkip}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-[480px] bg-white rounded-2xl shadow-2xl p-7 lg:p-8 flex flex-col items-center text-center z-10 border border-slate-100"
        >
          {/* Top-Right Close Button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            aria-label="Close"
          >
            <IoClose size={20} />
          </button>

          {/* Graphic Icon */}
          <div className="mb-5 mt-1">
            <TourWelcomeIcon className="w-24 h-24" />
          </div>

          {/* Overline Badge */}
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2563EB] mb-2">
            {badge}
          </span>

          {/* Headline */}
          <h2 className="text-[24px] lg:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
            {title}
          </h2>

          {/* Description */}
          <p className="text-[14px] text-slate-600 leading-relaxed mb-7 max-w-[380px]">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="w-full flex flex-col items-center gap-3">
            <button
              onClick={onStartTour}
              className="w-full py-3.5 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <span>{ctaText}</span>
              <FaArrowRight size={14} />
            </button>

            <button
              onClick={onSkip}
              className="py-1.5 px-4 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Skip for Now
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
