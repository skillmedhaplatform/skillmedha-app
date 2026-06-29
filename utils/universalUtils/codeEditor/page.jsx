"use client";
import React, { useEffect, useState } from "react";
import pageStyles from "./page.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  TbBulb,
  TbCode,
  TbArrowRight,
  TbCpu,
  TbChevronDown,
  TbChevronUp,
} from "react-icons/tb";
import { resetOutput, resetAiSuggestions } from "@/redux/slices/codeEditor";
import PlaygroundProvider from "./context/PlaygroundContext";
import Playground from ".";

const parseIfJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const CodingPage = ({ questionData }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("problem");
  const [expandedTC, setExpandedTC] = useState({});

  // ── Receive test case results from Playground via callback ────────────────
  const [tcResults, setTcResults] = useState({});
  // tcResults shape: { [index]: "passed" | "failed" | "error" | "running" }

  useEffect(() => {
    dispatch(resetOutput());
    dispatch(resetAiSuggestions());
  }, [dispatch]);

  const toggleTC = (index) => {
    setExpandedTC((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getDifficultyColors = (difficulty) => {
    const diff = difficulty?.toLowerCase() || "";
    if (diff === "easy") return { bg: "#e8f5e9", text: "#2e7d32" };
    if (diff === "hard") return { bg: "#fce4ec", text: "#c62828" };
    return { bg: "#fff3e0", text: "#e65100" }; // medium
  };

  const diffStyle = getDifficultyColors(questionData?.difficulty || "Medium");
  const testCases = questionData?.questionContent?.testCases || [];

  const getTcStatusStyle = (index) => {
    const status = tcResults[index];
    if (!status || status === "pending")
      return { cls: pageStyles.tcStatusPending, label: "Pending" };
    if (status === "running")
      return { cls: pageStyles.tcStatusPending, label: "Running..." };
    if (status === "passed")
      return { cls: pageStyles.tcStatusPass, label: "Passed ✅" };
    if (status === "failed")
      return { cls: pageStyles.tcStatusFail, label: "Failed ❌" };
    return { cls: pageStyles.tcStatusFail, label: "Error ⚠️" };
  };

  return (
    // FIX: wrap in .app so CSS variables + flex height are active
    <div className={pageStyles.app}>
      <div
        className={pageStyles.split}
        style={{ flex: 1, overflow: "hidden" }}
      >
        {/* ── Question Panel ── */}
        <div className={pageStyles.questionPanel}>
          {/* Tabs */}
          <div className={pageStyles.qpTabs}>
            {["problem", "hints", "solution"].map((tab) => (
              <div
                key={tab}
                className={`${pageStyles.qpTab} ${
                  activeTab === tab ? pageStyles.qpTabActive : ""
                }`}
                onClick={() => setActiveTab(tab)}
                style={{ textTransform: "capitalize" }}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* ── Problem Tab ── */}
          <div
            className={`${pageStyles.qpContent} ${
              activeTab === "problem" ? pageStyles.qpContentVisible : ""
            }`}
          >
            {/* Title + difficulty */}
            <div className={pageStyles.qTitleRow}>
              <h1 className={pageStyles.qMainTitle}>
                {questionData?.title ||
                  questionData?.questionName ||
                  "Coding Question"}
              </h1>
              <span
                className={pageStyles.difficulty}
                style={{
                  backgroundColor: diffStyle.bg,
                  color: diffStyle.text,
                  fontSize: "10px",
                }}
              >
                {questionData?.difficulty || "Medium"}
              </span>
            </div>

            {/* Description */}
            <div
              className={pageStyles.qDesc}
              dangerouslySetInnerHTML={{
                __html: parseIfJson(
                  questionData?.questionContent?.question ||
                    "<p>No description provided.</p>"
                ),
              }}
            />

            {/* Test Cases */}
            {testCases.length > 0 && (
              <div>
                <div className={pageStyles.secLabel}>
                  Test Cases
                  <span
                    style={{
                      background: "var(--bg-info)",
                      color: "var(--blue)",
                      fontSize: "10px",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      marginLeft: "4px",
                      fontWeight: 600,
                    }}
                  >
                    {testCases.length}
                  </span>
                </div>

                {testCases.map((tc, index) => {
                  const { cls, label } = getTcStatusStyle(index);
                  return (
                    <div
                      key={tc._id || index}
                      className={pageStyles.tcCard}
                    >
                      <div
                        className={pageStyles.tcHeader}
                        onClick={() => toggleTC(index)}
                      >
                        <span className={pageStyles.tcNum}>
                          <TbCode size={16} /> Test Case {index + 1}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span className={`${pageStyles.tcStatus} ${cls}`}>
                            {label}
                          </span>
                          {expandedTC[index] ? (
                            <TbChevronUp size={14} color="#90aac8" />
                          ) : (
                            <TbChevronDown size={14} color="#90aac8" />
                          )}
                        </div>
                      </div>

                      {expandedTC[index] && (
                        <div className={pageStyles.tcBody}>
                          {tc.input && (
                            <div className={pageStyles.tcRow}>
                              <span className={pageStyles.tcLbl}>Input</span>
                              <span className={pageStyles.tcVal}>
                                {parseIfJson(tc.input)}
                              </span>
                            </div>
                          )}
                          {tc.expectedOutput && (
                            <div className={pageStyles.tcRow}>
                              <span className={pageStyles.tcLbl}>Expected</span>
                              <span className={pageStyles.tcVal}>
                                {parseIfJson(tc.expectedOutput)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Constraints */}
            <div>
              <div className={pageStyles.secLabel}>Constraints</div>
              <div className={pageStyles.constraintsBox}>
                <div className={pageStyles.cItem}>
                  <TbArrowRight size={14} /> Time limit: 1 second
                </div>
                <div className={pageStyles.cItem}>
                  <TbCpu size={14} /> Memory limit: 256 MB
                </div>
              </div>
            </div>
          </div>

          {/* ── Hints Tab ── */}
          <div
            className={`${pageStyles.qpContent} ${
              activeTab === "hints" ? pageStyles.qpContentVisible : ""
            }`}
          >
            <div
              className={pageStyles.hintCard}
              style={{ borderLeftColor: "#ffa726" }}
            >
              <div
                className={pageStyles.hintTitle}
                style={{ color: "#e65100" }}
              >
                <TbBulb size={16} /> Hint 1
              </div>
              <div className={pageStyles.hintText}>
                Read the problem description carefully and identify edge cases.
              </div>
            </div>
            <div className={pageStyles.hintCard}>
              <div className={pageStyles.hintTitle}>
                <TbCode size={16} /> Hint 2
              </div>
              <div className={pageStyles.hintText}>
                Consider the optimal data structure that provides the best time
                complexity for your solution.
              </div>
            </div>
          </div>

          {/* ── Solution Tab ── */}
          <div
            className={`${pageStyles.qpContent} ${
              activeTab === "solution" ? pageStyles.qpContentVisible : ""
            }`}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--blue2)",
                marginBottom: "4px",
              }}
            >
              Step-by-step approach
            </div>
            <div className={pageStyles.solStep}>
              <div className={pageStyles.solNum}>1</div>
              <div className={pageStyles.solContent}>
                <div className={pageStyles.solStepTitle}>
                  Understand the input
                </div>
                <div className={pageStyles.solStepText}>
                  Analyze the constraints and structure of the input variables
                  provided.
                </div>
              </div>
            </div>
            <div className={pageStyles.solStep}>
              <div className={pageStyles.solNum}>2</div>
              <div className={pageStyles.solContent}>
                <div className={pageStyles.solStepTitle}>Implement logic</div>
                <div className={pageStyles.solStepText}>
                  Write the main logic adhering to optimal time and space
                  complexity.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Editor Panel ── */}
        <PlaygroundProvider>
          <Playground
            questionData={questionData}
            onTestResults={(results) => {
              // results: array of { index, status }
              const map = {};
              results.forEach((r) => {
                map[r.index] = r.status;
              });
              setTcResults(map);
            }}
          />
        </PlaygroundProvider>
      </div>
    </div>
  );
};

export default CodingPage;