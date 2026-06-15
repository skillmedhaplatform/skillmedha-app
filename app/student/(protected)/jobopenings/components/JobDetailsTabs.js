"use client";
// ─────────────────────────────────────────────────────────────
// components/JobDetailsTabs.js  —  antd Tabs (large, themed)
// ─────────────────────────────────────────────────────────────
import React from "react";
import { ConfigProvider, Segmented } from "antd";
import { OVERVIEW_FIELDS } from "../utils/jobUtils";

const PRIMARY = "#24A058";

// ── Tab content components ────────────────────────────────────

function OverviewTab({ job }) {
  const isClosed = job?.status === "closed" || false;

  return (
    <div className="w-full h-auto max-h-[80%] overflow-y-auto pb-6 pr-2 [&::-webkit-scrollbar]:w-[5px]">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-[#e2e8f0] rounded-xl p-4 bg-white shadow-sm flex flex-col justify-center">
          <p className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-wider mb-1 m-0">
            Category
          </p>
          <p className="text-[15px] font-bold text-[#1E69DA] m-0 leading-tight">
            {job?.sector || "Not specified"}
          </p>
        </div>
        <div className="border border-[#e2e8f0] rounded-xl p-4 bg-white shadow-sm flex flex-col justify-center">
          <p className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-wider mb-1 m-0">
            Function
          </p>
          <p className="text-[15px] font-bold text-[#1E69DA] m-0 leading-tight">
            {job?.jobTitle || "Not specified"}
          </p>
        </div>
        <div className="border border-[#e2e8f0] rounded-xl p-4 bg-white shadow-sm flex flex-col justify-center">
          <p className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-wider mb-1 m-0">
            CTC
          </p>
          <p className="text-[15px] font-bold text-[#1E69DA] m-0 leading-tight">
            {job?.ctc || "Not Disclosed"}
          </p>
        </div>
        <div className="border border-[#e2e8f0] rounded-xl p-4 bg-white shadow-sm flex flex-col justify-center">
          <p className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-wider mb-1 m-0">
            Location
          </p>
          <p className="text-[15px] font-bold text-[#1E69DA] m-0 leading-tight">
            {job?.city || "Not specified"}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-[16px] font-bold text-[#1E69DA] mb-2 m-0">Overview</h4>
        <p className="text-[14px] text-[#334155] leading-relaxed m-0 whitespace-pre-wrap">
          {job?.jobDescription || "No description provided."}
        </p>
      </div>

      {isClosed && (
        <div className="w-full bg-[#f0f6ff] rounded-xl p-4 border border-[#e2e8f0] flex items-center justify-center text-center">
          <p className="text-[15px] font-semibold text-[#64748b] m-0">
            Application Closed
          </p>
        </div>
      )}
    </div>
  );
}

function HiringTab({ job }) {
  return (
    <div className="w-full h-auto max-h-[80%] overflow-y-auto pb-20 flex flex-col gap-4 text-[20px] [&::-webkit-scrollbar]:w-[5px]">
      <p className="font-bold text-[16px] text-[#1E69DA] mb-2 w-full m-0">Hiring Workflow</p>
      <div className="w-full text-[15px] text-[#334155] h-full flex flex-col gap-4">
        {job?.interviewRounds?.length ? (
          job.interviewRounds.map((round, index) => (
            <div key={index} className="w-full flex p-3 border border-solid border-[#e5e7eb] rounded-[6px] shadow-sm">
              <p className="font-semibold m-0">
                {index + 1}. {round?.roundName}:{" "}
                <span className="font-normal">{round?.description}</span>
              </p>
            </div>
          ))
        ) : (
          <p className="m-0 text-[#64748b]">No interview rounds specified.</p>
        )}
      </div>
    </div>
  );
}

function EligibilityTab({ job }) {
  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar]:w-[5px]">
      <h4 className="font-bold text-[16px] text-[#1E69DA] mb-2 m-0">Eligibility Criteria</h4>
      {job?.eligibilityCriteria?.length ? (
        job.eligibilityCriteria.map((item, index) => (
          <div key={index} className="p-4 border border-solid border-[#e5e7eb] rounded-xl shadow-sm bg-white [&_p]:text-[#374151] [&_p]:text-[14px] [&_p_strong]:text-[#1f2937] [&_p_strong]:mr-2 [&_p]:m-0 [&_p]:mb-2 last:[&_p]:mb-0">
            <p>
              <strong>Education Level:</strong> {item?.educationLevel || "N/A"}
            </p>
            <p>
              <strong>Minimum Marks Percentage:</strong>{" "}
              {item?.minMarksPercentage || "N/A"}%
            </p>
          </div>
        ))
      ) : (
        <p className="m-0 text-[#64748b]">No eligibility criteria specified.</p>
      )}
    </div>
  );
}

// ── Tab registry — data-driven ────────────────────────────────
const TAB_CONTENT = {
  overview: OverviewTab,
  hiring: HiringTab,
  eligibility: EligibilityTab,
};

// Segmented options — derived from the registry keys
const TAB_OPTIONS = Object.keys(TAB_CONTENT).map((key) => ({
  label: key.charAt(0).toUpperCase() + key.slice(1),
  value: key,
}));

// ── Main export ───────────────────────────────────────────────
export default function JobDetailsTabs({ job, selectedTab, onTabChange }) {
  const ActiveContent = TAB_CONTENT[selectedTab] ?? OverviewTab;

  return (
    <div className="h-full w-full flex flex-col">
      <ConfigProvider
        theme={{
          components: {
            Segmented: {
              itemSelectedBg:    "#ffffff",
              itemSelectedColor: "#1E69DA",
              itemColor:         "#64748b",
              itemHoverColor:    "#1E69DA",
              trackBg:           "#f1f5f9",
              trackPadding:      4,
              fontSize:          14,
            },
          },
        }}
      >
        <Segmented
          block
          value={selectedTab}
          onChange={onTabChange}
          options={TAB_OPTIONS}
          style={{ fontWeight: 600, padding: "4px", marginBottom: "1.5rem", borderRadius: "12px" }}
        />
      </ConfigProvider>

      <ActiveContent job={job} />
    </div>
  );
}
