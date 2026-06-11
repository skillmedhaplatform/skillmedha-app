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

  const language = codingQuestionsss.filter(
    (item) => item.language === tags.toString()
  );
  const codingQuestions = language?.map((e) => {
    return e?.question;
  });

  const [questionIndex, setQuestionIndex] = useState(0);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setQuestion(codingQuestions[questionIndex]));
  }, [questionIndex, codingQuestions[questionIndex]]);

  useEffect(() => {
    dispatch(resetOutput());
    dispatch(resetAiSuggestions());
  }, []);

  const toggleQuestionContainer = () => {
    setIsQuestionOpen(!isQuestionOpen);
  };

  return (
    <div className={pageStyles.container}>
      <div className={pageStyles.boxContainer}>
        <div className={`${pageStyles.questionContainer}`}>
          <div
            className={pageStyles.toggleButton}
            onClick={toggleQuestionContainer}
          >
            <span className={pageStyles.toggleText}>Question</span>
          </div>

          <div className={pageStyles.questionContent}>
            {/* Question Content */}
            <div
              className={pageStyles.question}
              dangerouslySetInnerHTML={{
                __html: parseIfJson(questionData?.questionContent?.question),
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              {questionData?.questionContent?.testCases &&
                questionData?.questionContent?.testCases?.length > 0 && (
                  <div className={pageStyles.testCasesSection}>
                    <h3 className={pageStyles.testCasesTitle}>
                      Test Cases:{" "}
                      <Tag color="blue">
                        {questionData?.questionContent?.testCases?.length || 0}
                      </Tag>
                    </h3>
                    {questionData?.questionContent?.testCases?.map(
                      (testCase, index) => (
                        <div
                          key={testCase._id || index}
                          className={pageStyles.testCase}
                        >
                          <div className={pageStyles.testCaseHeader}>
                            <strong>Test Case {index + 1}:</strong>
                          </div>

                          {testCase.input && (
                            <div className={pageStyles.testCaseInput}>
                              <span className={pageStyles.label}>Input: </span>
                              <div
                                className={pageStyles.codeBlock}
                                dangerouslySetInnerHTML={{
                                  __html: parseIfJson(testCase.input),
                                }}
                              />
                            </div>
                          )}

                          {testCase.expectedOutput && (
                            <div className={pageStyles.testCaseOutput}>
                              <span className={pageStyles.label}>Output: </span>
                              <div
                                className={pageStyles.codeBlock}
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
