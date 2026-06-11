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
  return (
    <div className="w-full text-[18px] flex flex-col gap-4 h-auto max-h-[80%] overflow-y-auto pb-20 [&::-webkit-scrollbar]:w-[5px]">
      {OVERVIEW_FIELDS.map(({ label, dataKey }) => (
        <p key={label} className="w-full flex m-0">
          <span className="font-black w-24 min-w-[6rem] flex">{label}: </span>
          {job?.[dataKey] || "N/A"}
        </p>
      ))}
    </div>
  );
}

function HiringTab({ job }) {
  return (
    <div className="w-full h-auto max-h-[80%] overflow-y-auto pb-20 flex flex-col gap-4 text-[20px] [&::-webkit-scrollbar]:w-[5px]">
      <p className="font-black text-[18px] mb-2 w-full m-0">🛠 Hiring Workflow</p>
      <div className="w-full text-[20px] h-full flex flex-col gap-4">
        {job?.interviewRounds?.length ? (
          job.interviewRounds.map((round, index) => (
            <div key={index} className="w-full flex">
              <p className="font-extrabold leading-[2rem] m-0">
                {index + 1}. {round?.roundName}:{" "}
                <span className="font-semibold">{round?.description}</span>
              </p>
            </div>
          ))
        ) : (
          <p className="m-0">No interview rounds specified.</p>
        )}
      </div>
    </div>
  );
}

function EligibilityTab({ job }) {
  return (
    <div className="w-full text-[20px] h-full flex flex-col gap-4 overflow-y-auto [&_h4]:text-[1.25rem] [&_h4]:mb-3 [&_h4]:text-[#111827] [&_h4]:m-0">
      <h4>Eligibility Criteria</h4>
      {job?.eligibilityCriteria?.length ? (
        job.eligibilityCriteria.map((item, index) => (
          <div key={index} className="p-3 border border-solid border-[#e5e7eb] rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] [&_p]:text-[#374151] [&_p]:text-[0.95rem] [&_p_strong]:text-[#1f2937] [&_p_strong]:mr-2 [&_p]:m-0 [&_p]:mb-1 last:[&_p]:mb-0">
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
        <p className="m-0">No eligibility criteria specified.</p>
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
    <div className="h-full w-full">
      <ConfigProvider
        theme={{
          components: {
            Segmented: {
              itemSelectedBg:    PRIMARY,
              itemSelectedColor: "#ffffff",
              itemActiveBg:      PRIMARY,
              trackBg:           "rgba(39,174,96,0.1)",
              fontSize:          15,
            },
          },
        }}
      >
        <Segmented
          block
          value={selectedTab}
          onChange={onTabChange}
          options={TAB_OPTIONS}
          style={{ fontWeight: 600, padding: "3px", marginBottom: "1rem" }}
        />
      </ConfigProvider>

      <ActiveContent job={job} />
    </div>
  );
}
