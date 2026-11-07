"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

export default function TourTooltip({
  step,
  totalSteps = 6,
  targetRect,
  onNext,
  onPrevious,
  onSkip,
}) {
  const isFirstStep = step.stepIndex === 1;
  const isLastStep = step.stepIndex === totalSteps;

  // Calculate position coordinates
  const coords = useMemo(() => {
    if (!targetRect || typeof window === "undefined") {
      return { top: 120, left: 120 };
    }

    const cardWidth = 360;
    const estimatedCardHeight = 260;
    const padding = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = targetRect.x;
    let top = targetRect.y;

    let placement = step.placement;
    const offset = step.preferredOffset || { x: 0, y: 0 };
    const defaultGap = 20;

    // Smart flip to avoid collisions if placement would overflow viewport
    if (placement === "right" && targetRect.right + (offset.x !== 0 ? offset.x : defaultGap) + cardWidth > vw - padding) {
      if (targetRect.left - cardWidth - defaultGap >= padding) {
        placement = "left";
      }
    } else if (placement === "left" && targetRect.left - cardWidth - (offset.x !== 0 ? Math.abs(offset.x) : defaultGap) < padding) {
      if (targetRect.right + cardWidth + defaultGap <= vw - padding) {
        placement = "right";
      }
    } else if (placement === "top" && targetRect.top - estimatedCardHeight - (offset.y !== 0 ? Math.abs(offset.y) : defaultGap) < padding) {
      if (targetRect.bottom + estimatedCardHeight + defaultGap <= vh - padding) {
        placement = "bottom";
      }
    } else if (placement === "bottom" && targetRect.bottom + (offset.y !== 0 ? offset.y : defaultGap) + estimatedCardHeight > vh - padding) {
      if (targetRect.top - estimatedCardHeight - defaultGap >= padding) {
        placement = "top";
      }
    }

    switch (placement) {
      case "right":
        left = targetRect.right + (offset.x !== 0 ? offset.x : defaultGap);
        top = targetRect.y + (targetRect.height / 2) - (estimatedCardHeight / 2) + (offset.y || 0);
        break;
      case "left":
        left = targetRect.left - cardWidth - (offset.x !== 0 ? Math.abs(offset.x) : defaultGap);
        top = targetRect.y + (targetRect.height / 2) - (estimatedCardHeight / 2) + (offset.y || 0);
        break;
      case "bottom-left":
        left = targetRect.x + (offset.x || 0);
        top = targetRect.bottom + (offset.y !== 0 ? offset.y : defaultGap);
        break;
      case "bottom":
        left = targetRect.x + targetRect.width / 2 - cardWidth / 2 + (offset.x || 0);
        top = targetRect.bottom + (offset.y !== 0 ? offset.y : defaultGap);
        break;
      case "top-left":
        left = targetRect.x + (offset.x || 0);
        top = targetRect.top - estimatedCardHeight - (offset.y !== 0 ? Math.abs(offset.y) : defaultGap);
        break;
      case "top-right":
        left = targetRect.right - cardWidth + (offset.x || 0);
        top = targetRect.top - estimatedCardHeight - (offset.y !== 0 ? Math.abs(offset.y) : defaultGap);
        break;
      case "top":
        left = targetRect.x + targetRect.width / 2 - cardWidth / 2 + (offset.x || 0);
        top = targetRect.top - estimatedCardHeight - (offset.y !== 0 ? Math.abs(offset.y) : defaultGap);
        break;
      default:
        left = targetRect.x;
        top = targetRect.bottom + defaultGap;
    }

    // Boundary constraints to keep tooltip fully visible within viewport
    const safeLeft = Math.max(padding, Math.min(left, vw - cardWidth - padding));
    const safeTop = Math.max(padding, Math.min(top, vh - estimatedCardHeight - padding));

    return { top: safeTop, left: safeLeft };
  }, [targetRect, step]);

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        width: 360,
        zIndex: 9999,
      }}
      className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.22)] p-5 border border-slate-100 flex flex-col pointer-events-auto"
    >
      {/* Header Row: Category Badge & Step Count / Close */}
      <div className="w-full flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB]">
          {step.category}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-slate-400">
            {step.stepIndex} of {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close tour"
          >
            <IoClose size={16} />
          </button>
        </div>
      </div>

      {/* Progress Segments */}
      <div className="w-full flex gap-1.5 mb-4">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`h-[3.5px] flex-1 rounded-full transition-all duration-300 ${
              idx < step.stepIndex ? "bg-[#2563EB]" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Title */}
      <h3 className="text-[17px] sm:text-[18px] font-extrabold text-slate-900 tracking-tight mb-3 leading-snug">
        {step.title}
      </h3>

      {/* Description */}
      <p className="text-[13.5px] text-slate-600 leading-[1.65] mb-6">
        {step.description}
      </p>

      {/* Footer Navigation Controls */}
      <div className="w-full flex items-center justify-between pt-1">
        <button
          onClick={onSkip}
          className="text-[13px] font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          Skip tour
        </button>

        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <button
              onClick={onPrevious}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[13px] transition-colors cursor-pointer"
            >
              Previous
            </button>
          )}

          <button
            onClick={onNext}
            className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-semibold text-[13px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>{isLastStep ? "Finish" : "Next"}</span>
            <FaArrowRight size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
