"use client";
import React, { useEffect, useState } from "react";
import pageStyles from "./page.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { Divider, Spin, Tag, Tooltip } from "antd";
import {
  resetOutput,
  setQuestion,
  resetAiSuggestions,
} from "@/redux/slices/codeEditor";
import PlaygroundProvider from "./context/PlaygroundContext";
import Playground from ".";

const parseIfJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};

const CodingPage = ({ questionData }) => {
  const output = useSelector((state) => state.codeEditor.output);
  const aiSuggestions =
    useSelector((state) => state.codeEditor.aiSuggestions) || [];

  const codingQuestionsss = [];

  // State for collapsible question container
  const [isQuestionOpen, setIsQuestionOpen] = useState(true);

  const [questionIndex, setQuestionIndex] = useState(0);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetOutput());
    dispatch(resetAiSuggestions());
  }, []);

  const toggleQuestionContainer = () => {
    setIsQuestionOpen(!isQuestionOpen);
  };

  const getDifficultyColors = (difficulty) => {
    const diff = difficulty?.toLowerCase() || "";
    if (diff === "easy") {
      return { bg: "#DEF7EC", text: "#03543F" };
    } else if (diff === "hard") {
      return { bg: "#FDE8E8", text: "#9B1C1C" };
    }
    return { bg: "#FEF08A", text: "#854D0E" }; // medium
  };

  const diffStyle = getDifficultyColors(questionData?.difficulty || "Medium");

  return (
    <div className={pageStyles.container}>
      <div className={pageStyles.boxContainer}>
        <div className={`${pageStyles.questionContainer}`}>
          {/* Header section displaying Question */}
          <div className={pageStyles.tabHeader} style={{ padding: "14px 16px" }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Question</span>
          </div>

          <div className={pageStyles.questionContent}>
            {/* Meta details */}
            <div className={pageStyles.metaSection}>
              <h1 className={pageStyles.questionTitle}>
                {questionData?.title || questionData?.questionName || "Coding Question"}
              </h1>
              <div className={pageStyles.badgesRow}>
                <span className={pageStyles.categoryBadge}>
                  Coding - {questionData?.tags?.length ? questionData.tags.join(", ") : "Arrays"}
                </span>
                <span
                  className={pageStyles.difficultyBadge}
                  style={{
                    backgroundColor: diffStyle.bg,
                    color: diffStyle.text,
                  }}
                >
                  {questionData?.difficulty || "Medium"}
                </span>
              </div>
            </div>

            {/* Question HTML Description */}
            <div
              className={pageStyles.question}
              dangerouslySetInnerHTML={{
                __html: parseIfJson(questionData?.questionContent?.question),
              }}
            />

            {/* Test Cases List */}
            {questionData?.questionContent?.testCases &&
              questionData?.questionContent?.testCases?.length > 0 && (
                <div className={pageStyles.testCasesSection}>
                  <h3 className={pageStyles.testCasesTitle}>
                    Test Cases
                    <span className={pageStyles.testCasesCountBadge}>
                      {questionData?.questionContent?.testCases?.length || 0}
                    </span>
                  </h3>
                  {questionData?.questionContent?.testCases?.map(
                    (testCase, index) => (
                      <div
                        key={testCase._id || index}
                        className={pageStyles.testCaseCard}
                      >
                        <div className={pageStyles.testCaseHeader}>
                          <span className={pageStyles.testCaseName}>
                            ⚡ Test Case {index + 1}
                          </span>
                          <span className={pageStyles.testCaseStatusBadge}>
                            Pending
                          </span>
                        </div>

                        {testCase.input && (
                          <div className={pageStyles.testCaseDetail}>
                            <span className={pageStyles.detailLabel}>Input</span>
                            <div
                              className={pageStyles.detailCodeBlock}
                              dangerouslySetInnerHTML={{
                                __html: parseIfJson(testCase.input),
                              }}
                            />
                          </div>
                        )}

                        {testCase.expectedOutput && (
                          <div className={pageStyles.testCaseDetail}>
                            <span className={pageStyles.detailLabel}>Expected</span>
                            <div
                              className={pageStyles.detailCodeBlock}
                              dangerouslySetInnerHTML={{
                                __html: parseIfJson(testCase.expectedOutput),
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
          </div>
        </div>

        <div className={pageStyles.box}>
          <PlaygroundProvider>
            <Playground questionData={questionData} />
          </PlaygroundProvider>
        </div>
      </div>
    </div>
  );
};

export default CodingPage;
