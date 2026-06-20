"use client";
// ─────────────────────────────────────────────────────────────
// components/JobDetailsHeader.js  —  Header with optimistic apply
// isApplied and applyPending are passed from parent
// ─────────────────────────────────────────────────────────────
import React from "react";
import { Button, ConfigProvider, Tooltip } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, SendOutlined } from "@ant-design/icons";
import CountdownTimer from "./countdowntimer";
import { getEligibilityStatus } from "./eligibilityCheck";

const PRIMARY = "#24A058";

export default function JobDetailsHeader({
  job,
  student,
  isApplied,
  onApply,
  applyPending,
}) {
  const [timerExpired, setTimerExpired] = React.useState(false);

  const { eligible, reason } = getEligibilityStatus(student, job);
  const firstLetter = job?.companyName ? job.companyName.charAt(0).toUpperCase() : "C";

  // Check if deadline is already over based on job.endDate
  let isDeadlinePassed = false;
  if (job?.endDate) {
    const endTime = new Date(job.endDate).getTime();
    if (!isNaN(endTime)) {
      isDeadlinePassed = endTime <= new Date().getTime();
    }
  }

  const isDeadlineOver = isDeadlinePassed || timerExpired;

  const renderApplyButton = () => {
    if (isApplied) {
      return (
        <span className="px-4 py-1.5 rounded-full bg-blue-50 text-[#1E69DA] font-bold text-[13px] border border-blue-100">
          Already Applied
        </span>
      );
    }

    if (isDeadlineOver || job?.status === "closed") {
      return (
        <span className="px-4 py-1.5 rounded-full bg-red-50 text-[#ef4444] font-bold text-[13px] border border-red-100">
          Deadline Closed
        </span>
      );
    }

    return (
      <Tooltip title={!eligible ? reason : ""}>
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY } }}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={onApply}
            disabled={!eligible}
            loading={applyPending}
            size="large"
            className="rounded-full px-6 font-bold"
          >
            Apply Now
          </Button>
        </ConfigProvider>
      </Tooltip>
    );
  };

  return (
    <div className="flex items-center justify-between mb-6 border border-[#e2e8f0] bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        {job?.companyLogo ? (
          <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
            <img
              src={job?.companyLogo}
              alt="Company logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E69DA] to-[#5694F0] flex items-center justify-center text-white font-bold text-[24px] flex-shrink-0">
            {firstLetter}
          </div>
        )}
        <div className="flex flex-col">
          <p className="text-[20px] font-bold text-[#1E69DA] m-0 leading-tight">
            {job?.companyName} - {job?.jobTitle}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[14px] text-[#64748b] font-medium m-0">
              {job?.companyName}
              {job?.city && <span className="mx-1">•</span>}
              {job?.city}
            </p>
            {isDeadlineOver || job?.status === "closed" ? (
              <span className="px-2 py-0.5 rounded-full bg-red-50 text-[#ef4444] text-[11px] font-bold border border-red-100">
                Deadline Closed
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        {!isDeadlineOver && job?.status !== "closed" && (
          <div className="hidden md:block">
            <CountdownTimer jobEndDate={job?.endDate} onDeadlineOver={setTimerExpired} />
          </div>
        )}
        {renderApplyButton()}
      </div>
    </div>
  );
}
