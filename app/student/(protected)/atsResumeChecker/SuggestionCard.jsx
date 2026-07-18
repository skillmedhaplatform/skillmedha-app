"use client";

import React, { useState } from "react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  BulbOutlined,
  RiseOutlined,
} from "@ant-design/icons";

const CATEGORY_LABELS = {
  keywords: "Keywords",
  formatting: "Formatting",
  sections: "Sections",
  readability: "Readability",
  actionVerbs: "Action Verbs",
  quantification: "Quantification",
  contact: "Contact Info",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
};

const PRIORITY_STYLES = {
  high: { border: "border-l-[#e8447a]", badge: "bg-[#fce7f3] text-[#e8447a]" },
  medium: { border: "border-l-[#d97706]", badge: "bg-[#fef3c7] text-[#d97706]" },
  low: { border: "border-l-[#0e85c7]", badge: "bg-[#eff6ff] text-[#0e85c7]" },
};

const SuggestionCard = ({ suggestion }) => {
  const [decision, setDecision] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const {
    category,
    priority,
    title,
    original,
    suggested,
    reason,
    impactPoints,
    section,
  } = suggestion || {};

  const handleKeep = (e) => {
    e.stopPropagation();
    setDecision(decision === "keep" ? null : "keep");
  };

  const handleAbort = (e) => {
    e.stopPropagation();
    setDecision(decision === "abort" ? null : "abort");
  };

  const priorityStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.low;
  const categoryLabel = CATEGORY_LABELS[category] || category;
  const impactLabel =
    impactPoints > 0 ? `+${impactPoints} pts` : `${impactPoints || 0} pts`;

  const decisionRingClass =
    decision === "keep"
      ? "border-[#1E69DA] bg-[#eff6ff]"
      : decision === "abort"
      ? "opacity-60 bg-[#fafafa]"
      : "border-[#e2e8f0]";

  return (
    <div
      className={`rounded-lg overflow-hidden border-[1.5px] border-l-[4px] transition-all ${priorityStyle.border} ${decisionRingClass}`}
      role="article"
      aria-label={`Suggestion: ${title}`}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 bg-[#f8fafc] cursor-pointer flex-wrap"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${priorityStyle.badge}`}>
            {priority}
          </span>

          <span className="text-[12px] text-[#64748b] bg-[#e8f0f8] px-2 py-0.5 rounded">
            {categoryLabel}
          </span>

          {section && (
            <span className="text-[12px] px-2 py-0.5 rounded bg-[#e8f5e9] text-[#1C8A63]">
              {section}
            </span>
          )}

          <span className="text-[14px] font-semibold text-[#071631] flex-1">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {impactPoints > 0 && (
            <span className="text-[12px] font-bold text-[#1E69DA] bg-[#dbeafe] px-2 py-0.5 rounded-full whitespace-nowrap">
              <RiseOutlined /> {impactLabel}
            </span>
          )}

          {decision === "keep" && (
            <CheckCircleOutlined style={{ color: "#27ae60", fontSize: 18 }} />
          )}

          {decision === "abort" && (
            <CloseCircleOutlined style={{ color: "#e74c3c", fontSize: 18 }} />
          )}

          <DownOutlined
            className={`text-[#64748b] transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-[#e2e8f0]">
          {(original || suggested) && (
            <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-3 mb-4">
              {original && (
                <div className="rounded-md px-3 py-2.5 bg-[#fef9f9] border border-[#f5c6cb]">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-[#e8447a] mb-1.5">
                    Before (Original)
                  </div>
                  <p className="text-[13px] leading-relaxed m-0 text-[#7b2c2c]">{original}</p>
                </div>
              )}

              {suggested && (
                <div className="rounded-md px-3 py-2.5 bg-[#eff6ff] border border-[#bfdbfe]">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-[#1E69DA] mb-1.5">
                    After (Suggested)
                  </div>
                  <p className="text-[13px] leading-relaxed m-0 text-[#0d3a7a]">{suggested}</p>
                </div>
              )}
            </div>
          )}

          {reason && (
            <div className="rounded-md px-3 py-2.5 bg-[#f8fafc] mb-4">
              <div className="text-[10px] font-bold text-[#0e85c7] uppercase tracking-wide mb-1">
                <BulbOutlined /> Why change this?
              </div>
              <p className="text-[13px] text-[#071631] leading-relaxed m-0">{reason}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              className={`px-6 py-2 rounded-md text-[13px] font-bold border-2 transition-all ${
                decision === "abort"
                  ? "bg-[#e8447a] text-white border-[#e8447a]"
                  : "bg-transparent text-[#e8447a] border-[#e8447a] hover:bg-[#fce7f3]"
              }`}
              onClick={handleAbort}
            >
              {decision === "abort" ? (
                <>
                  <CloseCircleOutlined /> Aborted
                </>
              ) : (
                <>✕ Abort</>
              )}
            </button>

            <button
              className={`px-6 py-2 rounded-md text-[13px] font-bold border-2 transition-all ${
                decision === "keep"
                  ? "bg-[#1E69DA] text-white border-[#1E69DA]"
                  : "bg-[#1E69DA] text-white border-[#1E69DA] hover:brightness-110"
              }`}
              onClick={handleKeep}
            >
              {decision === "keep" ? (
                <>
                  <CheckCircleOutlined /> Kept ✓
                </>
              ) : (
                <>✓ Keep</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;
