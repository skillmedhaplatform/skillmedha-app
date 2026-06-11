"use client";
// ─────────────────────────────────────────────────────────────
// components/JobCard.js  —  Single card in the list panel
// isApplied is passed from parent (optimistic-aware)
// ─────────────────────────────────────────────────────────────
import React from "react";
import timeAgo from "@/helpers/timeAgo";

export default function JobCard({ job, isSelected, onSelect, isApplied }) {
  const statusClass = isApplied ? "applied" : "notApplied";

  return (
    <div
      className={`p-2 border border-solid border-[rgba(128,128,128,0.5)] border-r-0 font-semibold cursor-pointer ${isSelected ? "bg-[#24A058]/20" : "bg-transparent"}`}
      onClick={() => onSelect(job._id)}
    >
      <p className="text-[20px] font-extrabold">{job?.companyName}</p>
      <div className="text-[18px] font-semibold [&_p]:whitespace-nowrap [&_p]:overflow-hidden [&_p]:text-ellipsis">
        <p>{job?.city ?? "Not Mentioned"}</p>
      </div>
      <div className="flex items-center justify-between text-[0.8rem] mt-2">
        <p>{timeAgo(job.createdAt)}</p>
        <p className={`rounded-[20rem] px-2 py-1 ${isApplied ? "bg-[#0c59b68b]" : "bg-[#ff86407c]"}`}>
          {isApplied ? "Applied" : "Not Applied"}
        </p>
      </div>
    </div>
  );
}
