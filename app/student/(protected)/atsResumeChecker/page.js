"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, Badge, Button } from "antd";
import {
  FileSearchOutlined,
  BarChartOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";

import {
  setActiveTab,
  setShowFeedbackModal,
  resetAnalysis,
  fetchATSHistory,
} from "@/redux/atsSlice";
import { getSstorage } from "@/universalUtils/windowMW";

import ResumeUpload from "./ResumeUpload.jsx";
import ATSReport from "./ATSReport.jsx";
import HistoryPanel from "./HistoryPanel.jsx";
import FeedbackModal from "./FeedbackModal.jsx";

const scoreBadgeColor = (score) => {
  if (score >= 80) return "#1C8A63";
  if (score >= 60) return "#d97706";
  return "#e8447a";
};

const ATSCheckerPage = () => {
  const dispatch = useDispatch();

  const atsState = useSelector((state) => state?.ats);

  const {
    activeTab = "upload",
    currentAnalysis = null,
    history = [],
    historyStatus = "idle",
    showFeedbackModal = false,
  } = atsState || {};

  useEffect(() => {
    if (historyStatus === "idle" && typeof window !== "undefined") {
      const studentId = getSstorage("studentId");
      if (studentId) {
        dispatch(fetchATSHistory({ studentId }));
      }
    }
  }, [dispatch, historyStatus]);

  const handleTabChange = (key) => {
    dispatch(setActiveTab(key));
  };

  const handleStartNew = () => {
    dispatch(resetAnalysis());
    dispatch(setActiveTab("upload"));
  };

  const tabItems = [
    {
      key: "upload",
      label: (
        <span className="flex items-center gap-1.5">
          <FileSearchOutlined /> Analyze Resume
        </span>
      ),
      children: <ResumeUpload />,
    },
    {
      key: "report",
      label: (
        <span className="flex items-center gap-1.5">
          <BarChartOutlined /> ATS Report
          {currentAnalysis && (
            <Badge
              count={currentAnalysis.overallScore}
              style={{
                backgroundColor: scoreBadgeColor(currentAnalysis.overallScore),
                marginLeft: 4,
                fontSize: 10,
              }}
            />
          )}
        </span>
      ),
      children: <ATSReport onStartNew={handleStartNew} />,
      disabled: !currentAnalysis,
    },
    {
      key: "history",
      label: (
        <span className="flex items-center gap-1.5">
          <HistoryOutlined /> History
          {history.length > 0 && (
            <Badge
              count={history.length}
              style={{
                backgroundColor: "#1E69DA",
                marginLeft: 4,
                fontSize: 10,
              }}
            />
          )}
        </span>
      ),
      children: <HistoryPanel />,
    },
  ];

  return (
    <div className="flex flex-col gap-4 bg-[#EFF5FB] min-h-screen">
      <StudentPageHeader
        // section="Resume Tools"
        title="ATS Resume Checker"
        subtitle="AI-powered analysis to optimize your resume for Applicant Tracking Systems."
        rightSlot={
          currentAnalysis && (
            <Button
              onClick={() => dispatch(setShowFeedbackModal(true))}
              className="!bg-transparent !text-white !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all"
            >
              Give Feedback
            </Button>
          )
        }
      />

      <div className="px-4 lg:px-8 flex flex-col gap-4 pb-8">
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-3 text-[13px] text-[#071631] flex items-center gap-2">
          <span className="text-base shrink-0">💡</span>
          <span>
            Over <strong>75%</strong> of resumes are rejected by ATS before
            reaching a human recruiter. Our AI analyzes your resume across 6
            key dimensions and provides actionable suggestions to maximize
            your chances.
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-3 lg:p-4">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            size="large"
          />
        </div>
      </div>

      <FeedbackModal
        open={showFeedbackModal}
        onClose={() => dispatch(setShowFeedbackModal(false))}
      />
    </div>
  );
};

export default ATSCheckerPage;
