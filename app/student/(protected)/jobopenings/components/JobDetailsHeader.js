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
    <div className="w-full bg-white border border-[#e2e8f0] rounded-[16px] p-4 xl:p-6 mb-4 xl:mb-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
      <div className="flex items-center gap-3 xl:gap-4 w-full">
        {job?.companyLogo ? (
          <div className="w-12 h-12 xl:w-16 xl:h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
            <img
              src={job?.companyLogo}
              alt="Company logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 xl:w-16 xl:h-16 rounded-xl bg-[#1E69DA] flex items-center justify-center text-white font-bold text-[22px] xl:text-[28px] flex-shrink-0">
            {firstLetter}
          </div>
        )}
        <div className="flex flex-col gap-0.5 xl:gap-1">
          <div className="flex items-center gap-2 xl:gap-3">
            <p className="text-[18px] xl:text-[22px] font-bold text-[#0f172a] m-0 leading-tight">
              {job?.companyName} {job?.jobTitle ? `- ${job.jobTitle}` : ''}
            </p>
            {job?.status !== "closed" && !isDeadlineOver && (
              <span className="px-2 py-0.5 rounded bg-[#dcfce7] text-[#16a34a] text-[12px] font-bold">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[14px] text-[#64748b] font-medium m-0 flex items-center">
              <span className="mr-1">🏢</span> {job?.companyName}
              {job?.city && <span className="mx-2">•</span>}
              {job?.city && <span className="mr-1">📍</span>} {job?.city}
            </p>

          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 w-full xl:w-auto">
        {!isDeadlineOver && job?.status !== "closed" && (
          <div className="hidden lg:block">
            <CountdownTimer jobEndDate={job?.endDate} onDeadlineOver={setTimerExpired} />
          </div>
        )}
        {renderApplyButton()}
      </div>
    </div>
  );
}
