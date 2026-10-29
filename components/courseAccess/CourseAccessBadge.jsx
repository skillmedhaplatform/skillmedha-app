"use client";

import { BsCheckCircleFill, BsGiftFill, BsLockFill, BsStack } from "react-icons/bs";

// Small pill on a course card image: Free / Bundle only / Premium.
// Owned courses keep the library's existing "Enrolled" pill.
const STYLES = {
  free: { icon: BsGiftFill, label: "Free", className: "bg-emerald-500/90 text-white" },
  bundle: { icon: BsStack, label: "Bundle only", className: "bg-violet-600/90 text-white" },
  premium: { icon: BsLockFill, label: "Premium", className: "bg-amber-500/90 text-white" },
  owned: { icon: BsCheckCircleFill, label: "Unlocked", className: "bg-white/20 text-white border border-white/30" },
};

export default function CourseAccessBadge({ kind, label, className = "" }) {
  const style = STYLES[kind];
  if (!style) return null;
  const Icon = style.icon;
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 shadow-sm backdrop-blur-md ${style.className} ${className}`}
    >
      <Icon className="text-[10px]" />
      <span className="text-[10px] font-bold uppercase tracking-wide">{label || style.label}</span>
    </div>
  );
}
