"use client";
// ─────────────────────────────────────────────────────────────
// components/JobCard.js  —  Single card in the list panel
// isApplied is passed from parent (optimistic-aware)
// ─────────────────────────────────────────────────────────────
import React from "react";
import timeAgo from "@/helpers/timeAgo";

export default function JobCard({ job, isSelected, onSelect, isApplied }) {
  const isClosed = job?.status === "closed" || false; // Just an example, assuming we need to determine if it's closed
  const firstLetter = job?.companyName ? job.companyName.charAt(0).toUpperCase() : "C";

  return (
    <div
      className={`p-3 rounded-xl border transition-all cursor-pointer ${
        isSelected 
          ? "bg-[#f0f6ff] border-[#1E69DA] shadow-sm" 
          : "bg-white border-[#e2e8f0] hover:border-[#cbd5e1] shadow-sm"
      }`}
      onClick={() => onSelect(job._id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E69DA] to-[#5694F0] flex items-center justify-center text-white font-bold text-[20px] flex-shrink-0">
            {firstLetter}
          </div>
          <div className="flex flex-col">
            <p className="text-[15px] font-bold text-[#1E69DA] m-0 leading-tight truncate max-w-[120px]" title={job?.companyName}>
              {job?.companyName}
            </p>
            <p className="text-[13px] text-[#64748b] font-medium m-0 truncate max-w-[120px]" title={job?.jobTitle}>
              {job?.jobTitle || "Role not specified"}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 ml-2">
          {isClosed ? (
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-[#ef4444] text-[11px] font-bold border border-red-100">
              Closed
            </span>
          ) : isApplied ? (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1E69DA] text-[11px] font-bold border border-blue-100">
              Applied
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#f97316] text-[11px] font-bold border border-orange-100">
              Not Applied
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <p className="text-[12px] text-[#94a3b8] font-medium m-0">
            {timeAgo(job.createdAt)}
          </p>
          {job?.isAssignedJob === false && (
            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[10px] font-bold border border-purple-100 uppercase tracking-wider">
              Created by TPO
            </span>
          )}
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#f0f6ff] text-[#0ea5e9] text-[11px] font-semibold">
          {job?.workModel || "Remote"}
        </span>
      </div>
    </div>
  );
}
