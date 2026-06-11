"use client";
import React, { useState } from "react";
import { Segmented, Tag, Spin } from "antd";
import { LoadingOutlined, BookOutlined, CodeOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import PlaygroundProvider from "@/universalUtils/codeEditor/context/PlaygroundContext";
import Playground from "@/universalUtils/codeEditor";
import styles from "./mobilePracticePlayer.module.scss";

function MobileCodingContent({ questionData }) {
  const [activeTab, setActiveTab] = useState("problem");
  const output = useSelector((state) => state.codeEditor.output);
  const aiSuggestions = useSelector((state) => state.codeEditor.aiSuggestions) || [];

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
        {activeTab === "problem" && (
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
        )}

        {activeTab === "code" && (
          <div className={styles.editorPane}>
            <Playground questionData={questionData} />
          </div>
        )}

        {activeTab === "output" && (
          <div className={styles.outputPane}>
            <div className={styles.consoleBlock}>
              <h3>Execution Results</h3>
              <pre>{output || "Run code to view output console here..."}</pre>
            </div>
            
            {aiSuggestions && aiSuggestions.length > 0 && (
              <div className={styles.aiSuggBlock}>
                <h3>AI Test Cases Feedback</h3>
                <div className={styles.aiList}>
                  {aiSuggestions.map((item, idx) => {
                    const key = Object.keys(item)?.[0];
                    const value = item?.[key];
                    const isPass = value?.toLowerCase().includes("pass");

                    return (
                      <div
                        key={idx}
                        className={`${styles.aiItem} ${isPass ? styles.passFeedback : styles.failFeedback}`}
                      >
                        <strong>{key}:</strong> {value}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
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
