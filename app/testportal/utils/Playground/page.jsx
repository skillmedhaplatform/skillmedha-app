"use client";
import Home from "@/app/page";
import React, { useEffect, useState } from "react";
import Playground from ".";
import pageStyles from "./page.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { Spin, Tooltip } from "antd";
import {
  resetOutput,
  setQuestion,
  resetAiSuggestions,
} from "@/app/testportal/redux/slices/codeEditor";
import PlaygroundProvider from "./context/PlaygroundContext";

const parseIfJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};

const CodingPage = ({ questionData }) => {
  // console.log(questionData);

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
        <Tooltip title="Tap to open question">
          <div
            className={`${pageStyles.questionContainer} ${
              isQuestionOpen ? pageStyles.open : pageStyles.closed
            }`}
          >
            <div
              className={pageStyles.toggleButton}
              onClick={toggleQuestionContainer}
            >
              <span className={pageStyles.toggleIcon}>
                {isQuestionOpen ? "◀" : "▶"}
              </span>

              {isQuestionOpen && (
                <span className={pageStyles.toggleText}>Question</span>
              )}
            </div>

            {isQuestionOpen && (
              <div className={pageStyles.questionContent}>
                {/* Question Content */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: parseIfJson(
                      questionData?.questionContent?.question
                    ),
                  }}
                />

                {/* Test Cases Section */}
                {questionData?.questionContent?.testCases &&
                  questionData?.questionContent?.testCases?.length > 0 && (
                    <div className={pageStyles.testCasesSection}>
                      <h3 className={pageStyles.testCasesTitle}>Test Cases:</h3>
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
                                <span className={pageStyles.label}>
                                  Input:{" "}
                                </span>
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
                                <span className={pageStyles.label}>
                                  Output:{" "}
                                </span>
                                <div
                                  className={pageStyles.codeBlock}
                                  dangerouslySetInnerHTML={{
                                    __html: parseIfJson(
                                      testCase.expectedOutput
                                    ),
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
            )}
          </div>
        </Tooltip>

        <div className={pageStyles.box}>
          <PlaygroundProvider>
            <Playground questionData={questionData} />
          </PlaygroundProvider>
        </div>

        <div className={`${pageStyles.output}`}>
          <div className={pageStyles.outputHeader}>Output</div>
          {/* <div
            className={`${pageStyles.outputBody} ${
              output.toLowerCase().includes("error") ||
              output.toLowerCase().includes("exception")
                ? pageStyles.error
                : ""
            }`}
          >
            {output?.includes("Accepted")
              ? output?.split("Accepted")[1]
              : output}
          </div> */}
          <div className={pageStyles.suggestionCont}>
            {aiSuggestions?.map((item, index) => {
              const key = Object.keys(item)[0];
              const value = item[key];

              return (
                <div
                  key={index}
                  className={pageStyles.outputBody}
                  style={{
                    backgroundColor: key === "Fail" ? "#ffe5e5" : "transparent",
                    color: key === "Fail" ? "#d60000" : "inherit",
                  }}
                >
                  <p>
                    {key}: {value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingPage;
