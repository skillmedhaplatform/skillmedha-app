"use client";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin, Tooltip } from "antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  keepAllSuggestions,
  abortAllSuggestions,
  resetDecisions,
  generateUpdatedResume,
} from "@/redux/atsSlice";
import ScoreGauge from "./ScoreGauge";
import SuggestionCard from "./SuggestionCard";

const getCategoryColor = (score) => {
  if (score >= 80) return "#1C8A63";
  if (score >= 65) return "#0e85c7";
  if (score >= 50) return "#d97706";
  if (score >= 35) return "#e67e22";
  return "#e8447a";
};

const GRADE_STYLES = {
  "A+": "text-[#1E69DA] bg-[#dbeafe]",
  A: "text-[#1E69DA] bg-[#dbeafe]",
  B: "text-[#0e85c7] bg-[#d0ecf8]",
  C: "text-[#d97706] bg-[#fef3c7]",
  D: "text-[#e67e22] bg-[#fdebd0]",
  F: "text-[#e8447a] bg-[#fce7f3]",
};

const getGrade = (score) => {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
};

const ATSReport = ({ onStartNew }) => {
  const dispatch = useDispatch();

  const atsState = useSelector((s) => s.ats || {});
  const {
    currentAnalysis = null,
    decisions = {},
    downloadStatus = "idle",
    downloadUrl = "",
  } = atsState;

  const decisionStats = useMemo(() => {
    const suggestions = Array.isArray(currentAnalysis?.suggestions)
      ? currentAnalysis.suggestions
      : [];

    const total = suggestions.length;
    const decisionValues = Object.values(decisions || {});
    const kept = decisionValues.filter((d) => d === "keep").length;
    const aborted = decisionValues.filter((d) => d === "abort").length;

    return {
      kept,
      aborted,
      undecided: Math.max(total - kept - aborted, 0),
      total,
    };
  }, [currentAnalysis, decisions]);

  const sortedSuggestions = useMemo(() => {
    const suggestions = Array.isArray(currentAnalysis?.suggestions)
      ? currentAnalysis.suggestions
      : [];

    const priorityOrder = { high: 0, medium: 1, low: 2 };

    return [...suggestions].sort(
      (a, b) =>
        (priorityOrder[a?.priority] ?? 3) - (priorityOrder[b?.priority] ?? 3)
    );
  }, [currentAnalysis]);

  const handleGenerateAndDownload = () => {
    if (!currentAnalysis?.analysisId) return;

    dispatch(
      generateUpdatedResume({
        analysisId: currentAnalysis.analysisId,
        decisions: decisions || {},
      })
    );
  };

  useEffect(() => {
    if (downloadStatus === "ready" && downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "updated_resume.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [downloadStatus, downloadUrl]);

  if (!currentAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#64748b] text-[14px]">
        <Spin />
        <span>Loading report...</span>
      </div>
    );
  }

  const {
    overallScore = 0,
    categoryScores = {},
    strengths = [],
    criticalIssues = [],
    originalFileName = "",
    originalFileUrl = "",
  } = currentAnalysis;

  const grade = getGrade(overallScore);
  const gradeClass = GRADE_STYLES[grade];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-[16px] font-bold text-[#071631]">
          ATS Analysis Report
          {originalFileName && (
            <span className="font-normal text-[13px] text-[#64748b] ml-2">
              — {originalFileName}
            </span>
          )}
        </div>

        <button
          className="px-4 py-2 rounded-lg text-[13px] font-semibold border border-[#1E69DA] text-[#1E69DA] bg-transparent hover:bg-[#eff6ff] transition-colors flex items-center gap-1.5"
          onClick={onStartNew}
        >
          <ReloadOutlined /> Analyze New Resume
        </button>
      </div>

      <div className="grid grid-cols-[auto_1fr] max-[768px]:grid-cols-1 gap-8 items-center bg-white rounded-xl p-6 shadow-sm border border-[#e2e8f0] max-[768px]:text-center">
        <div className="max-[768px]:mx-auto">
          <ScoreGauge score={overallScore} size={220} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 max-[768px]:justify-center">
            <div className={`text-[2rem] font-black px-4 py-2 rounded-lg leading-none ${gradeClass}`}>
              {grade}
            </div>

            <div>
              <div className="font-bold text-[17px] text-[#071631]">
                {overallScore >= 80
                  ? "ATS Optimized"
                  : overallScore >= 60
                  ? "Needs Improvement"
                  : "High Risk of Rejection"}
              </div>

              <div className="text-[13px] text-[#64748b]">
                {overallScore >= 80
                  ? "Your resume is well-optimized for ATS systems."
                  : overallScore >= 60
                  ? "Implement the suggestions below to improve your score."
                  : "Critical issues found. Apply suggestions to avoid being filtered out."}
              </div>
            </div>
          </div>

          {categoryScores && Object.keys(categoryScores).length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
              {Object.entries(categoryScores).map(([key, cat]) => (
                <div key={key} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3">
                  <div className="text-[12px] font-semibold text-[#64748b] mb-1.5">
                    {cat?.label || key}
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-[16px] font-bold"
                      style={{ color: getCategoryColor(cat?.score || 0) }}
                    >
                      {cat?.score || 0}
                    </span>
                    <span className="text-[11px] text-[#64748b]">
                      / {cat?.maxScore || 100}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${cat?.score || 0}%`,
                        backgroundColor: getCategoryColor(cat?.score || 0),
                      }}
                    />
                  </div>

                  {cat?.description && (
                    <div className="text-[11px] text-[#64748b] mt-1.5">
                      {cat.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(strengths.length > 0 || criticalIssues.length > 0) && (
        <div className="grid grid-cols-2 max-[768px]:grid-cols-1 gap-4">
          {strengths.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border-t-[3px] border-t-[#1E69DA] border border-[#e2e8f0]">
              <h4 className="text-[14px] font-bold mb-3 flex items-center gap-2 text-[#1E69DA] m-0">
                <TrophyOutlined /> Strengths ({strengths.length})
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-2 mt-3">
                {strengths.map((s, i) => (
                  <li key={i} className="text-[13px] text-[#64748b] flex items-start gap-2 leading-snug">
                    <span className="text-[#1E69DA] mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {criticalIssues.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border-t-[3px] border-t-[#e8447a] border border-[#e2e8f0]">
              <h4 className="text-[14px] font-bold mb-3 flex items-center gap-2 text-[#e8447a] m-0">
                <WarningOutlined /> Critical Issues ({criticalIssues.length})
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-2 mt-3">
                {criticalIssues.map((issue, i) => (
                  <li key={i} className="text-[13px] text-[#64748b] flex items-start gap-2 leading-snug">
                    <span className="text-[#e8447a] mt-0.5">✗</span> {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {sortedSuggestions.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e2e8f0]">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <h3 className="text-[15px] font-bold text-[#071631] m-0 flex items-center">
              Improvement Suggestions ({sortedSuggestions.length})
              <Tooltip title="Review each suggestion and click 'Keep' to accept or 'Abort' to reject. Each kept suggestion will be applied to your updated resume.">
                <InfoCircleOutlined className="ml-1.5 text-[#94a3b8] text-[13px]" />
              </Tooltip>
            </h3>

            <div className="flex gap-2">
              <button
                className="px-3.5 py-1.5 rounded-md text-[12px] font-semibold border-[1.5px] border-[#1E69DA] text-[#1E69DA] bg-transparent hover:bg-[#eff6ff] transition-colors flex items-center gap-1"
                onClick={() => dispatch(keepAllSuggestions())}
              >
                <CheckCircleOutlined /> Keep All
              </button>

              <button
                className="px-3.5 py-1.5 rounded-md text-[12px] font-semibold border-[1.5px] border-[#e8447a] text-[#e8447a] bg-transparent hover:bg-[#fce7f3] transition-colors flex items-center gap-1"
                onClick={() => dispatch(abortAllSuggestions())}
              >
                <CloseCircleOutlined /> Abort All
              </button>

              {Object.values(decisions || {}).some((d) => d !== null) && (
                <button
                  className="px-3.5 py-1.5 rounded-md text-[12px] font-semibold border-[1.5px] border-[#94a3b8] text-[#64748b] bg-transparent hover:bg-[#f8fafc] transition-colors"
                  onClick={() => dispatch(resetDecisions())}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="text-[12px] text-[#64748b] mb-4">
            Reviewed:{" "}
            <span className="font-bold text-[#1E69DA]">
              {decisionStats.kept + decisionStats.aborted}
            </span>{" "}
            / {decisionStats.total} &nbsp;|&nbsp;
            <CheckCircleOutlined style={{ color: "#27ae60" }} />{" "}
            {decisionStats.kept} kept &nbsp;·&nbsp;
            <CloseCircleOutlined style={{ color: "#e74c3c" }} />{" "}
            {decisionStats.aborted} aborted &nbsp;·&nbsp;
            {decisionStats.undecided} undecided
          </div>

          <div className="flex flex-col gap-3">
            {sortedSuggestions.map((s, index) => (
              <SuggestionCard key={s?.id || index} suggestion={s} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border-[1.5px] border-[#bfdbfe]">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="text-[15px] font-bold text-[#071631]">
            Download Your Updated Resume
          </div>

          <div className="flex gap-4 text-[13px] text-[#64748b] flex-wrap">
            <div className="flex items-center gap-1">
              <CheckCircleOutlined style={{ color: "#27ae60" }} />
              <span className="font-bold text-[#071631]">{decisionStats.kept}</span>{" "}
              suggestions kept
            </div>

            <div className="flex items-center gap-1">
              <CloseCircleOutlined style={{ color: "#e74c3c" }} />
              <span className="font-bold text-[#071631]">{decisionStats.aborted}</span>{" "}
              suggestions aborted
            </div>
          </div>
        </div>

        {decisionStats.undecided > 0 && (
          <div className="bg-[#fef3c7] border border-[#fde68a] rounded-md px-3.5 py-2.5 text-[13px] text-[#78350f] mb-4">
            ⚠️ You have <strong>{decisionStats.undecided}</strong> undecided
            suggestion(s). Undecided suggestions will <strong>not</strong> be
            applied to the updated resume. Review all suggestions above and mark
            them as Keep or Abort.
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold text-white bg-gradient-to-br from-[#1E69DA] to-[#5694F0] hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            onClick={handleGenerateAndDownload}
            disabled={downloadStatus === "loading" || decisionStats.kept === 0}
            aria-disabled={decisionStats.kept === 0}
          >
            {downloadStatus === "loading" ? (
              <>
                <Spin size="small" />
                Generating...
              </>
            ) : (
              <>
                <DownloadOutlined />
                Download Updated Resume ({decisionStats.kept} changes applied)
              </>
            )}
          </button>

          {originalFileUrl && (
            <a
              href={originalFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold border-[1.5px] border-[#94a3b8] text-[#64748b] hover:border-[#071631] hover:text-[#071631] transition-colors"
              download
            >
              <DownloadOutlined />
              Download Original Resume
            </a>
          )}
        </div>

        {downloadStatus === "error" && (
          <div className="bg-[#fdecea] border border-[#f5c6cb] rounded-lg px-4 py-3 text-[13px] text-[#c0392b] flex items-center gap-2 mt-3">
            ⚠️ Failed to generate updated resume. Please try again.
          </div>
        )}

        {decisionStats.kept === 0 && decisionStats.total > 0 && (
          <div className="text-[12px] text-[#64748b] mt-2">
            Keep at least one suggestion to generate an updated resume.
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSReport;
