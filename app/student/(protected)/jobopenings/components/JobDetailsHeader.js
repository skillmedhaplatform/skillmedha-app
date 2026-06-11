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
  isDeadlineOver,
  onDeadlineOver,
  onApply,
  applyPending,
}) {
  const { eligible, reason } = getEligibilityStatus(student, job);

  const renderApplyButton = () => {
    if (isApplied) {
      return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY } }}>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled
            size="large"
          >
            Already Applied
          </Button>
        </ConfigProvider>
      );
    }

    if (isDeadlineOver) {
      return (
        <Button
          type="default"
          icon={<ClockCircleOutlined />}
          disabled
          size="large"
          danger
        >
          Deadline Closed
        </Button>
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
          >
            Apply Now
          </Button>
        </ConfigProvider>
      </Tooltip>
    );
  };


  return (
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-start gap-2">
        <div className="w-12 h-12 rounded-full bg-gray-500 relative overflow-hidden object-contain flex-shrink-0">
          <img
            src={job?.companyLogo}
            alt="Company logo"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
        <div className="flex flex-col">
          <p className="text-[23px] font-black m-0 leading-tight">
            {job?.companyName} - {job?.jobTitle}
          </p>
          <p className="text-[18px] font-semibold m-0 mb-2">
            {job?.companyName}
            {job?.companyName && <span> - </span>}
            {job?.city}
          </p>
          {renderApplyButton()}
        </div>
      </div>

      <div className="w-1/4 flex flex-col items-end justify-center gap-2">
        <CountdownTimer jobEndDate={job?.endDate} onDeadlineOver={onDeadlineOver} />
      </div>
    </div>
  );
}
