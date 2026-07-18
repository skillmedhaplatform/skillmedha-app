"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSstorage } from "@/universalUtils/windowMW";
import { Spin } from "antd";
import {
  HistoryOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { fetchAnalysisById, fetchATSHistory } from "@/redux/atsSlice";

const formatDate = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
};

const getScoreClasses = (score) => {
  if (score >= 80) return "text-[#1E69DA] bg-[#dbeafe]";
  if (score >= 60) return "text-[#d97706] bg-[#fef3c7]";
  return "text-[#e8447a] bg-[#fce7f3]";
};

const HistoryPanel = () => {
  const dispatch = useDispatch();

  const { history = [], historyStatus, error } = useSelector((s) => s.ats || {});
  const studentId = getSstorage("studentId");

  useEffect(() => {
    if (studentId) {
      dispatch(fetchATSHistory({ studentId, page: 1, limit: 20 }));
    }
  }, [dispatch, studentId]);

  const handleViewAnalysis = (analysisId) => {
    if (!analysisId) return;
    dispatch(fetchAnalysisById(analysisId));
  };

  const handleRefresh = () => {
    if (!studentId) return;
    dispatch(fetchATSHistory({ studentId, page: 1, limit: 20 }));
  };

  if (!studentId) {
    return (
      <div className="flex flex-col gap-3">
        <div className="bg-[#fdecea] border border-[#f5c6cb] rounded-lg px-4 py-3 text-[13px] text-[#c0392b]">
          ⚠️ Student ID not found. Please login again.
        </div>
      </div>
    );
  }

  if (historyStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#64748b] text-[14px]">
        <Spin />
        <span>Loading your analysis history...</span>
      </div>
    );
  }

  if (historyStatus === "failed") {
    return (
      <div className="flex flex-col gap-3">
        <div className="bg-[#fdecea] border border-[#f5c6cb] rounded-lg px-4 py-3 text-[13px] text-[#c0392b] flex items-center gap-2 flex-wrap">
          ⚠️ {error || "Failed to load history."}{" "}
          <button
            onClick={handleRefresh}
            className="bg-transparent border-none text-[#c0392b] cursor-pointer font-bold underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12 text-[#64748b]">
        <div className="text-[2.5rem] mb-3 text-[#94a3b8]">
          <HistoryOutlined />
        </div>
        <h3 className="text-[15px] font-bold text-[#071631] mb-1.5">
          No analysis history yet
        </h3>
        <p className="text-[13px]">
          Upload and analyze your first resume to see results here.
          All your past analyses are saved and accessible anytime.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <div className="font-bold text-[#071631] text-[14px]">
          {history.length} Resume{history.length !== 1 ? "s" : ""} Analyzed
        </div>

        <button
          onClick={handleRefresh}
          className="bg-transparent border-[1.5px] border-[#e2e8f0] rounded-md px-3 py-1.5 cursor-pointer text-[#64748b] text-[12px] flex items-center gap-1 hover:border-[#1E69DA] hover:text-[#1E69DA] transition-colors"
          title="Refresh history"
        >
          <ReloadOutlined /> Refresh
        </button>
      </div>

      {history.map((item, index) => {
        const analysisId = item.analysisId || item._id;
        const overallScore = item.overallScore || 0;

        return (
          <div
            key={analysisId || index}
            className="bg-white border-[1.5px] border-[#e2e8f0] rounded-lg px-5 py-4 flex items-center justify-between gap-4 flex-wrap hover:border-[#1E69DA] hover:shadow-sm transition-all"
          >
            <div className="flex flex-col gap-1 flex-1">
              <div className="text-[14px] font-bold text-[#071631]">
                {item.originalFileName || "Resume"}
              </div>

              <div className="text-[12px] text-[#64748b]">
                {formatDate(item.createdAt)}
                {item.suggestionsCount > 0 && (
                  <span className="ml-2 text-[#1C8A63]">
                    · {item.suggestionsCount} suggestion
                    {item.suggestionsCount !== 1 ? "s" : ""}
                  </span>
                )}
                {item.keptCount > 0 && (
                  <span className="ml-2 text-[#2980b9]">
                    · {item.keptCount} kept
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`text-[17px] font-black px-3 py-1.5 rounded-lg leading-none ${getScoreClasses(overallScore)}`}
                title={`ATS Score: ${overallScore}/100`}
              >
                {overallScore}
              </div>

              {item.updatedResumeUrl && (
                <a
                  href={item.updatedResumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1 border-[1.5px] border-[#1E69DA] text-[#1E69DA] px-3 py-1.5 rounded-md text-[12px] font-semibold hover:bg-[#eff6ff] transition-colors"
                  title="Download updated resume"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DownloadOutlined /> Updated
                </a>
              )}

              <button
                className="flex items-center gap-1 border-[1.5px] border-[#1E69DA] text-[#1E69DA] px-3 py-1.5 rounded-md text-[12px] font-semibold hover:bg-[#eff6ff] transition-colors"
                onClick={() => handleViewAnalysis(analysisId)}
                title="View full analysis report"
              >
                <EyeOutlined /> View Report
              </button>
            </div>
          </div>
        );
      })}

      <div className="text-[11px] text-[#94a3b8] text-center pt-3 border-t border-[#e2e8f0] mt-1">
        🔒 Your resumes are securely stored and only accessible to you.
        Files are retained for 90 days.
      </div>
    </div>
  );
};

export default HistoryPanel;
