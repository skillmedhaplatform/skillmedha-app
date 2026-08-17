"use client";
import React, { useState } from "react";
import { Segmented, Tag, Spin, Button } from "antd";
import { LoadingOutlined, BookOutlined, CodeOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import PlaygroundProvider from "@/universalUtils/codeEditor/context/PlaygroundContext";
import Playground from "@/universalUtils/codeEditor";
import styles from "./mobilePracticePlayer.module.scss";
import { requestRunTests } from "@/redux/slices/codeEditor";

function MobileCodingContent({ questionData }) {
  const [activeTab, setActiveTab] = useState("problem");
  const output = useSelector((state) => state.codeEditor.output);
  const testCaseResults = useSelector((state) => state.codeEditor.testCaseResults) || [];
  const triggerRunTests = useSelector((state) => state.codeEditor.triggerRunTests);
  const dispatch = useDispatch();

  const getFeedbackClass = (status) => {
    if (status === "passed") return styles.passFeedback;
    if (status === "failed" || status === "error") return styles.failFeedback;
    return "";
  };

  const handleRunTests = () => {
    dispatch(requestRunTests());
    setActiveTab("output");
  };

  return (
    <div className={styles.codingPlayerCon}>
      {/* 1. Sub-tabs Selector */}
      <div className={styles.tabsHeader}>
        <Segmented
          block
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { label: "📖 Problem", value: "problem" },
            { label: "💻 Code", value: "code" },
            { label: "🖥️ Output", value: "output" },
          ]}
        />
      </div>

      {/* 2. Scrollable Body Content */}
      <div className={styles.codingBody}>
        {/* Tab 1: Problem */}
        <div style={{ display: activeTab === "problem" ? "block" : "none" }}>
          <div className={styles.problemPane}>
            <div
              className={styles.questionText}
              dangerouslySetInnerHTML={{
                __html: parseIfJson(questionData?.questionContent?.question),
              }}
            />
            {questionData?.questionContent?.testCases &&
              questionData?.questionContent?.testCases?.length > 0 && (
                <div className={styles.testCasesPane}>
                  <h3>
                    Test Cases <Tag color="blue">{questionData.questionContent.testCases.length}</Tag>
                  </h3>
                  {questionData.questionContent.testCases.map((testCase, idx) => (
                    <div key={testCase._id || idx} className={styles.testCaseItem}>
                      <strong>Test Case {idx + 1}:</strong>
                      {testCase.input && (
                        <div>
                          <span className={styles.tag}>Input:</span>
                          <pre dangerouslySetInnerHTML={{ __html: parseIfJson(testCase.input) }} />
                        </div>
                      )}
                      {testCase.expectedOutput && (
                        <div>
                          <span className={styles.tag}>Output:</span>
                          <pre dangerouslySetInnerHTML={{ __html: parseIfJson(testCase.expectedOutput) }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Tab 2: Code Editor */}
        <div className={styles.editorPane} style={{ display: activeTab === "code" ? "block" : "none" }}>
          <Playground questionData={questionData} />
        </div>

        {/* Tab 3: Output / Test Results */}
        <div className={styles.outputPane} style={{ display: activeTab === "output" ? "flex" : "none" }}>
          <div className={styles.consoleBlock}>
            <h3>Execution Results</h3>
            <pre>{output || "Run code to view output console here..."}</pre>
          </div>

          <div className={styles.aiSuggBlock}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#475569" }}>Test Cases Results</h3>
              <Button
                type="primary"
                size="small"
                loading={triggerRunTests}
                onClick={handleRunTests}
                style={{ background: "#1f6feb", borderColor: "#1f6feb" }}
              >
                {triggerRunTests ? "Running..." : "▶ Run Tests"}
              </Button>
            </div>

            {testCaseResults.length === 0 && !triggerRunTests ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#8b949e", fontSize: "0.85rem", background: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                No test results yet. Click "Run Tests" to evaluate your code.
              </div>
            ) : (
              <div className={styles.aiList}>
                {testCaseResults.map((tc, idx) => {
                  const isPassed = tc.status === "passed";
                  const isFailed = tc.status === "failed";
                  const isError = tc.status === "error";
                  const isRunning = tc.status === "running";

                  return (
                    <div
                      key={idx}
                      className={`${styles.aiItem} ${getFeedbackClass(tc.status)}`}
                      style={
                        isRunning
                          ? { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8" }
                          : {}
                      }
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong>
                          {isRunning ? "⏳" : isPassed ? "✅" : isError ? "⚠️" : "❌"} Test Case {idx + 1}
                        </strong>
                        <span style={{ fontSize: "11px", fontWeight: "700" }}>
                          {isRunning ? "RUNNING" : isPassed ? "PASSED" : isError ? "ERROR" : isFailed ? "FAILED" : ""}
                        </span>
                      </div>
                      {tc.input && (
                        <div style={{ fontSize: "11px", marginTop: "4px" }}>
                          <span style={{ color: "#64748b", fontWeight: "600" }}>INPUT: </span>
                          <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 4px", borderRadius: "3px", fontFamily: "monospace" }}>{tc.input}</code>
                        </div>
                      )}
                      {tc.expectedOutput && (
                        <div style={{ fontSize: "11px", marginTop: "2px" }}>
                          <span style={{ color: "#64748b", fontWeight: "600" }}>EXPECTED: </span>
                          <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 4px", borderRadius: "3px", color: "#15803d", fontFamily: "monospace" }}>{tc.expectedOutput}</code>
                        </div>
                      )}
                      {tc.actualOutput && (
                        <div style={{ fontSize: "11px", marginTop: "2px" }}>
                          <span style={{ color: "#64748b", fontWeight: "600" }}>GOT: </span>
                          <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 4px", borderRadius: "3px", color: isPassed ? "#15803d" : "#b91c1c", fontFamily: "monospace" }}>{tc.actualOutput}</code>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MobileCodingPlayer({ questionData }) {
  return (
    <PlaygroundProvider>
      <MobileCodingContent questionData={questionData} />
    </PlaygroundProvider>
  );
}
