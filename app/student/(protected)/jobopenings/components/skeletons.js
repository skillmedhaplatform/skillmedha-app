"use client";
// ─────────────────────────────────────────────────────────────
// components/skeletons.js  —  Skeleton components (pixel-accurate)
// ─────────────────────────────────────────────────────────────
import React from "react";
import { Skeleton } from "antd";
import { JOB_DETAIL_TABS, OVERVIEW_FIELDS, OVERVIEW_SKELETON_WIDTHS } from "../utils/jobUtils";

/** Matches the exact `.job` card dimensions from main.module.scss */
export function JobListSkeleton() {
  return (
    <div className="p-2 border border-solid border-[rgba(128,128,128,0.5)] border-r-0 font-semibold cursor-default">
      {/* .jobTitle: 20px */}
      <Skeleton.Input active size="small" style={{ width: "55%", height: 20, marginBottom: 6 }} block />
      {/* .jobCompContainer: 18px */}
      <Skeleton.Input active size="small" style={{ width: "40%", height: 16, marginBottom: 8 }} block />
      {/* .jobStatusCont: flex space-between */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton.Input active size="small" style={{ width: 60, height: 12 }} />
        <Skeleton.Button active size="small" style={{ width: 80, height: 22, borderRadius: "20rem" }} />
      </div>
    </div>
  );
}

/** Matches the exact `.jobDetailsContainer` layout from main.module.scss */
export function JobDetailsSkeleton() {
  return (
    <>
      {/* .jobDetailsHeader */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2">
          {/* .profile: 3rem × 3rem circle */}
          <div className="w-12 h-12 rounded-full bg-gray-500 relative overflow-hidden object-contain flex-shrink-0">
            <Skeleton.Avatar active size={48} shape="circle" style={{ width: "3rem", height: "3rem" }} />
          </div>
          <div className="flex flex-col">
            {/* .jobTitle: 23px */}
            <Skeleton.Input active size="default" style={{ width: 260, height: 23, marginBottom: 6 }} />
            {/* .subHead: 18px */}
            <Skeleton.Input active size="small" style={{ width: 180, height: 18, marginBottom: 10 }} />
            {/* Apply button: height ~42px */}
            <Skeleton.Button active style={{ width: 120, height: 42, borderRadius: 5 }} />
          </div>
        </div>
        {/* .headerright — countdown area */}
        <div className="w-1/4 flex flex-col items-end justify-center gap-2">
          <Skeleton.Input active size="small" style={{ width: 110, height: 16 }} />
        </div>
      </div>

      {/* .jobDetailsCont */}
      <div className="h-full w-full">
        {/* 3 equal tabs at 0.5rem padding */}
        <div className="w-full my-4 flex items-center justify-center border border-solid border-red-500">
          {JOB_DETAIL_TABS.map(({ key, label }, i) => (
            <div
              key={key}
              className={`w-1/3 text-center rounded-[0.1rem] border border-solid border-[rgba(128,128,128,0.5)] py-2 font-extrabold cursor-pointer ${i === 0 ? "bg-[#24A058] text-white" : "bg-[#24A058]/20"}`}
              style={{ opacity: 0.35 }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Overview rows: .strongText 6rem + content, 1rem gap */}
        <div className="w-full text-[18px] flex flex-col gap-4 h-auto max-h-[80%] overflow-y-auto pb-20 [&::-webkit-scrollbar]:w-[5px]">
          {OVERVIEW_FIELDS.map(({ label }, i) => (
            <div key={label} className="w-full flex">
              <Skeleton.Input active size="small" style={{ minWidth: "6rem", width: "6rem", height: 18 }} />
              <Skeleton.Input
                active
                size="small"
                style={{ width: OVERVIEW_SKELETON_WIDTHS[i], height: 18, marginLeft: 8 }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
