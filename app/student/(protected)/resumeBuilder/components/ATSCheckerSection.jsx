import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge, Button } from "antd";
import {
  FileSearchOutlined,
  BarChartOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";

import {
  setActiveTab,
  setShowFeedbackModal,
  resetAnalysis,
  fetchATSHistory,
} from "@/redux/atsSlice";
import { getSstorage } from "@/universalUtils/windowMW";

import ResumeUpload from "../../atsResumeChecker/ResumeUpload.jsx";
import ATSReport from "../../atsResumeChecker/ATSReport.jsx";
import HistoryPanel from "../../atsResumeChecker/HistoryPanel.jsx";
import FeedbackModal from "../../atsResumeChecker/FeedbackModal.jsx";

const scoreBadgeColor = (score) => {
  if (score >= 80) return "#1C8A63";
  if (score >= 60) return "#d97706";
  return "#e8447a";
};

const ATSCheckerSection = ({ onBack }) => {
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

  const scrollRef = React.useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="flex flex-col gap-0 relative bg-[#EFF5FB] h-screen overflow-hidden w-full">
      <StudentPageHeader
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

      {/* White Categories Bar */}
      <div className="bg-white border-b border-[#e2e8f0] px-4 md:px-8 py-3 flex items-center shadow-sm z-10 shrink-0 gap-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#475569] hover:text-[#3b82f6] transition-colors text-[14px] font-medium bg-transparent border-none shadow-none shrink-0 cursor-pointer p-0"
        >
          <ArrowLeftOutlined /> Back
        </button>
        
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden flex-1 cursor-grab active:cursor-grabbing select-none"
        >
          {/* Analyze Resume Tab */}
          <button 
            onClick={() => handleTabChange("upload")}
            className={`px-4 py-1.5 rounded-full text-[14px] whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "upload" 
                ? "text-[#3b82f6] bg-[#eff6ff] font-semibold" 
                : "text-[#64748b] hover:text-[#0f172a] font-medium"
            }`}
          >
            <FileSearchOutlined /> Analyze Resume
          </button>
          
          {/* ATS Report Tab */}
          <button 
            onClick={() => currentAnalysis && handleTabChange("report")}
            disabled={!currentAnalysis}
            className={`px-4 py-1.5 rounded-full text-[14px] whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "report" 
                ? "text-[#3b82f6] bg-[#eff6ff] font-semibold" 
                : "text-[#64748b] hover:text-[#0f172a] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
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
          </button>

          {/* History Tab */}
          <button 
            onClick={() => handleTabChange("history")}
            className={`px-4 py-1.5 rounded-full text-[14px] whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "history" 
                ? "text-[#3b82f6] bg-[#eff6ff] font-semibold" 
                : "text-[#64748b] hover:text-[#0f172a] font-medium"
            }`}
          >
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
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] hover:[&::-webkit-scrollbar-thumb]:bg-[#94a3b8]">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6 pb-10">
          
          {/* Info Banner */}
          <div className="bg-white border border-[#e2e8f0] shadow-sm rounded-xl px-4 py-3 text-[13px] text-[#0f172a] flex items-center gap-2">
            <span className="text-base shrink-0">💡</span>
            <span>
              Over <strong>75%</strong> of resumes are rejected by ATS before
              reaching a human recruiter. Our AI analyzes your resume across 6
              key dimensions and provides actionable suggestions to maximize
              your chances.
            </span>
          </div>

          {/* Content area without white background */}
          <div className="w-full">
            {activeTab === "upload" && <ResumeUpload />}
            {activeTab === "report" && <ATSReport onStartNew={handleStartNew} />}
            {activeTab === "history" && <HistoryPanel />}
          </div>
          
        </div>
      </div>

      <FeedbackModal
        open={showFeedbackModal}
        onClose={() => dispatch(setShowFeedbackModal(false))}
      />
    </div>
  );
};

export default ATSCheckerSection;
